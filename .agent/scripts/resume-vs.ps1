function NextResumePhase {
    if ('planner' -notin $script:resumeSafe) { return 'Planner' }
    $savedPlan=ReadResumeJson (Join-Path $phaseRoot 'planner.json')
    $planDirectory=$phaseRoot
    if ((RoleBlockerRoute $savedPlan $planDirectory 'planner') -eq 'classification') { return 'Legacy Planner classification' }
    for ($n=1; $savedPlan.verdict -eq 'BLOCKED' -and (RoleBlockerRoute $savedPlan $planDirectory 'planner') -eq 'design_closure' -and $n -le 2; $n++) {
        $prefix='design-closure-'+$n+'/'
        if (($prefix+'design-closure') -notin $script:resumeSafe) { return "Design closure $n" }
        if (($prefix+'planner') -notin $script:resumeSafe) { return "Planner recheck $n" }
        $savedPlan=ReadResumeJson (Join-Path $phaseRoot ($prefix+'planner.json'))
        $planDirectory=Join-Path $phaseRoot $prefix
        if ((RoleBlockerRoute $savedPlan $planDirectory 'planner') -eq 'classification') { return ('Legacy Planner classification: '+$prefix) }
    }
    if ($savedPlan.verdict -ne 'READY') {
        $route=RoleBlockerRoute $savedPlan $planDirectory 'planner'
        if ($route -eq 'infrastructure') { return 'INFRASTRUCTURE' }
        return ('BLOCKED: '+$route)
    }
    if ('contract' -notin $script:resumeSafe) { return 'Contract' }
    for ($attempt=0; $attempt -le 2; $attempt++) {
        $attemptPrefix=if ($attempt -eq 0) { '' } else { 'implementation-design-'+$attempt+'/' }
        if ($attempt -gt 0) {
            if (($attemptPrefix+'design-closure') -notin $script:resumeSafe) { return "Implementation design closure $attempt/2" }
            if (($attemptPrefix+'planner') -notin $script:resumeSafe) { return "Implementation Planner recheck $attempt/2" }
            $closure=ReadResumeJson (Join-Path $phaseRoot ($attemptPrefix+'design-closure.json'))
            $replan=ReadResumeJson (Join-Path $phaseRoot ($attemptPrefix+'planner.json'))
            if ($closure.verdict -ne 'READY' -or $replan.verdict -ne 'READY') {
                if ($attempt -eq 2 -or ($replan.verdict -eq 'BLOCKED' -and (RoleBlockerRoute $replan (Join-Path $phaseRoot $attemptPrefix) 'planner') -ne 'design_closure')) { return 'BLOCKED' }
                continue
            }
            if (($attemptPrefix+'contract') -notin $script:resumeSafe) { return "Revised contract $attempt/2" }
        }
        $correct=$false
        for ($n=0; $n -le 2; $n++) {
            $prefix=$attemptPrefix+$(if ($n -eq 0) { '' } else { 'review-fix-'+$n+'/' })
            if (($prefix+'implementer') -notin $script:resumeSafe) { return "Implementer (design cycle $attempt, review cycle $n)" }
            $impl=ReadResumeJson (Join-Path $phaseRoot ($prefix+'implementer.json'))
            if ($impl.verdict -eq 'BLOCKED') {
                $route=RoleBlockerRoute $impl (Join-Path $phaseRoot $prefix) 'implementer'
                if ($route -eq 'classification') { return ('Legacy Implementer classification: '+$prefix) }
                if ($route -eq 'infrastructure') { return 'INFRASTRUCTURE' }
                if ($route -eq 'implementation') { return 'BLOCKED: focused implementation handling' }
                if ($route -ne 'design_closure' -or $attempt -eq 2) { return ('BLOCKED: '+$route) }
                $correct=$true; break
            }
            foreach ($phase in @('tests','reviewer')) {
                if (($prefix+$phase) -notin $script:resumeSafe) { return ($phase.Substring(0,1).ToUpper()+$phase.Substring(1)+" (cycle $n)") }
            }
            $savedReview=ReadResumeJson (Join-Path $phaseRoot ($prefix+'reviewer.json'))
            if ($savedReview.verdict -eq 'PASS') { break }
            if ($savedReview.verdict -ne 'FIX REQUIRED' -or $n -eq 2) { return 'BLOCKED' }
        }
        if (!$correct) { break }
    }
    if ('commit-intent' -notin $script:resumeSafe) { return 'Final PASS archive/commit' }
    if ('completion' -notin $script:resumeSafe) { return 'Commit reconciliation' }
    if ($Publish -and 'published' -notin $script:resumeSafe) { return 'Publish reconciliation' }
    return 'Complete'
}
# Durable, fail-closed replay of host-validated phases. Never restores files.
function ReadResumeJson([string]$Path) {
    try { Get-Content -LiteralPath $Path -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop }
    catch { throw "BLOCKED: invalid/missing resume JSON: $Path" }
}
function ResumeHash([string]$Path) {
    try { (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash }
    catch { throw "BLOCKED: missing/unreadable trusted artifact: $Path" }
}
function SaveCheckpoint {
    if ($Smoke) { return }
    $evidence = @{}
    foreach ($file in Get-ChildItem -LiteralPath $phaseRoot -Recurse -File) {
        $relative = $file.FullName.Substring($phaseRoot.Length+1).Replace('\','/')
        if ($relative -in @('checkpoint.json','checkpoint.json.tmp','checkpoint.json.bak','checkpoint.sha256','stopped.json') -or $relative -like '*/stopped.json') { continue }
        $evidence[$relative] = ResumeHash $file.FullName
    }
    $value = @{version=1;vs=$id;branch=$Branch;base=$base;previous=$PreviousFinalCommit;previous_merge=$PreviousMergeCommit;
        predecessor_hash=([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes([string]$PreviousReviewText))));
        frozen=$script:resumeFrozen;state=(FileState $wt);index=((Invoke-FirmGit @('diff','--cached') $wt) -join "`n");head=((Invoke-FirmGit @('rev-parse','HEAD') $wt) -join '');
        next_phase=(NextResumePhase);safe=@($script:resumeSafe);evidence=$evidence;commit_intent=$script:resumeCommitIntent}
    # Flush bytes before atomic replacement; a crash leaves the previous checkpoint valid.
    $target = Join-Path $phaseRoot 'checkpoint.json'
    $temp = $target+'.tmp'
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes(($value | ConvertTo-Json -Depth 20))
    $stream = [IO.File]::Open($temp,[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::None)
    try { $stream.Write($bytes,0,$bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
    if (Test-Path -LiteralPath $target) { [IO.File]::Replace($temp,$target,$target+'.bak') } else { [IO.File]::Move($temp,$target) }
    $sealBytes=[Text.Encoding]::ASCII.GetBytes((ResumeHash $target))
    $sealStream=[IO.File]::Open((Join-Path $phaseRoot 'checkpoint.sha256'),[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::None)
    try { $sealStream.Write($sealBytes,0,$sealBytes.Length); $sealStream.Flush($true) } finally { $sealStream.Dispose() }
}
function MarkSafe([string]$Key) {
    $script:resumeSafe = @($script:resumeSafe + $Key | Sort-Object -Unique)
    SaveCheckpoint
    if (Get-Command firmCheckpointHook -ErrorAction SilentlyContinue) { firmCheckpointHook $Key }
}
function ResumeKey([string]$Role) {
    $prefix = if ($run -eq $phaseRoot) { '' } else { $run.Substring($phaseRoot.Length+1).Replace('\','/')+'/' }
    return $prefix+$Role
}
function AssertResumeCheckpoint($cp) {
    foreach ($field in @('version','vs','branch','base','previous','previous_merge','predecessor_hash','evidence','state','head','index','safe','commit_intent')) {
        if (!$cp -or !$cp.PSObject.Properties[$field]) { throw "BLOCKED: malformed checkpoint field: $field" }
    }
    $seal=Join-Path $phaseRoot 'checkpoint.sha256'
    if (!(Test-Path -LiteralPath $seal) -or (Get-Content -LiteralPath $seal -Raw) -cne (ResumeHash (Join-Path $phaseRoot 'checkpoint.json'))) { throw 'BLOCKED: checkpoint hash changed or incomplete durable write.' }
    if ($cp.version -ne 1 -or $cp.vs -cne $id -or $cp.branch -cne $Branch -or $cp.base -cne $base -or $cp.previous -cne $PreviousFinalCommit -or $cp.previous_merge -cne $PreviousMergeCommit) { throw 'BLOCKED: checkpoint identity/base/predecessor changed.' }
    $hash = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes([string]$PreviousReviewText)))
    if ($hash -cne $cp.predecessor_hash) { throw 'BLOCKED: predecessor evidence changed.' }
    foreach ($property in $cp.evidence.PSObject.Properties) {
        if ($property.Name -match '(^|/)\.\.(/|$)|[:\\]' -or [IO.Path]::IsPathRooted($property.Name)) { throw 'BLOCKED: checkpoint evidence path.' }
        $path = Join-Path $phaseRoot $property.Name
        if (!(Test-Path -LiteralPath $path -PathType Leaf) -or (ResumeHash $path) -cne $property.Value) { throw "BLOCKED: checkpoint evidence hash: $($property.Name)" }
    }
    $recorded = @{}; foreach ($property in $cp.state.PSObject.Properties) { $recorded[$property.Name]=$property.Value }
    if (@(StateChanges $recorded (FileState $wt)).Count) { throw 'BLOCKED: unknown/tampered worktree file hash; preserve files for manual review.' }
    $head = (Invoke-FirmGit @('rev-parse','HEAD') $wt) -join ''
    $index = (Invoke-FirmGit @('diff','--cached') $wt) -join "`n"
    if ($head -ne $cp.head) {
        if (!$cp.commit_intent -or ((Invoke-FirmGit @('rev-parse','HEAD^') $wt) -join '') -ne $cp.head -or ((Invoke-FirmGit @('rev-parse','HEAD^{tree}') $wt) -join '') -ne $cp.commit_intent -or $index) { throw 'BLOCKED: unexpected HEAD/index on resume.' }
        $script:resumeCommitted=$head
    } elseif ($index -cne $cp.index) { throw 'BLOCKED: checkpoint index changed.' }
    $script:resumeFrozen=@{}
    foreach ($property in $(if ($cp.PSObject.Properties['frozen']) { $cp.frozen.PSObject.Properties } else { @() })) { $script:resumeFrozen[$property.Name]=$property.Value }
    $script:resumeSafe=@($cp.safe); $script:resumeCommitIntent=$cp.commit_intent
}
function ImportLegacyVS006 {
    if ($id -ne 'VS-006' -or (Split-Path $phaseRoot -Leaf) -ne '20260916-203832-b1650e99' -or $base -ne '947154c01f8cac5a2d034605643235fe3d63e791') { throw 'BLOCKED: prior run lacks a trusted checkpoint.' }
    $pins = @{
        'invocation.json'='2967E76BAD40BF68C53BA0553D315A7C75FDDCC66E1FBB1E6D6083C4F131ABAA';
        'planner.json'='79770104C4517DBB93D395EA5C384437A49CB8133CCD8E12C3657E5A54425D73';
        'design-closure-1/planner.json'='7CB4DCBAC208F979BEF906307B9018535A59D99BF594698D3BC1C1CAB644B82B';
        'design-closure-1/design-closure.json'='C1D8A83D03E336C3C950B4754F8AD6D55568825AE67B50743C0BDFCC7FC2F7A4';
        'design-closure-1/closure-result.json'='D42D6D37D27912C52B8671D05C88CC9F02B025B675C5F091E12EA6FA4FF7A1EF';
        'design-closure-1/scope.json'='518823400C139CF0C546F91AAEDC5B4637D11BBC508A01BFD07B5591B32A6C6F';
        'contract.md'='AAB2765CB1BB3942E777BC10D65F2D50D35D0D8FA4FB7EFDACFB083A45405C63'
    }
    foreach ($key in $pins.Keys) { if ((ResumeHash (Join-Path $phaseRoot $key)) -cne $pins[$key]) { throw "BLOCKED: legacy artifact tampered: $key" } }
    $owned = @{
        '.agent/tasks/VS-006.md'=$pins['contract.md'];
        'DEC-LITIGATION-030_VS006_BOUNDED_COURT_FACT_FINDING.md'='0C366252F50867951998BE28C011280D26655214445137CA77DCD5A3F2C38E28';
        'TEST-029_VS006_BOUNDED_COURT_FACT_FINDING.md'='AA00238C0719C99A1C2B86102422916C22F0745D3FF5C4E5323657C95EB52275'
    }
    $dirty=@(Invoke-FirmGit @('status','--porcelain','--untracked-files=all') $wt | Where-Object { $_ -notlike '?? .agent/runs/*' })
    if ($dirty.Count -ne 3 -or ((Invoke-FirmGit @('rev-parse','HEAD') $wt) -join '') -ne $base) { throw 'BLOCKED: legacy worktree identity/dirtiness.' }
    foreach ($line in $dirty) {
        $file=$line.Substring(3)
        if (!$line.StartsWith('?? ') -or !$owned.ContainsKey($file) -or (ResumeHash (Join-Path $wt $file)) -cne $owned[$file]) { throw 'BLOCKED: unknown/tampered legacy dirty file.' }
    }
    $script:resumeSafe=@('planner','design-closure-1/design-closure','design-closure-1/planner','contract')
    SaveCheckpoint
}

# Explicit classification is required; a valid environmental BLOCKED never opens closure.
function ImplementationBlockerRoute($Result) {
    if ($Result.verdict -ne 'BLOCKED') { return 'none' }
    if ($Result.reason -match '(?i)sandbox|deny.read|ACL|CLI failed|tool (failure|error)|runtime (failure|error)|permission denied|access denied|network (failure|error)|timed? ?out|executable.*(missing|not found)') { return 'other' }
    if ($Result.PSObject.Properties['blocker_kind'] -and $Result.blocker_kind -ceq 'design_closure') { return 'design_closure' }
    return 'other'
}
