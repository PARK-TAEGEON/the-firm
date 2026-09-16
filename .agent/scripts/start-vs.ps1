[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidatePattern('^(VS-)?\d{1,3}$')][string]$VS,
    [string]$Repository = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [string]$WorktreeRoot,
    [string]$Branch,
    [string]$PreviousFinalCommit,
    [string]$PreviousReview,
    [string]$Godot = 'godot',
    [switch]$DryRun,
    [switch]$Smoke,
    [switch]$Publish
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$number = [int]($VS -replace '^VS-','')
if ($number -lt 1) { throw 'VS must be 1..999.' }
$id = 'VS-{0:000}' -f $number
$Repository = (Resolve-Path -LiteralPath $Repository).Path
if (!$WorktreeRoot) { $WorktreeRoot = Join-Path (Split-Path $Repository -Parent) 'THE-FIRM-VS' }
if (!$Branch) { $Branch = 'task/vs-{0:000}' -f $number }
if ($Branch -notmatch ('(^|/)vs-{0:000}$' -f $number)) { throw 'Branch must end in vs-XXX matching the requested VS.' }
function Invoke-FirmGit([string[]]$Arguments, [string]$At=$Repository) {
    $ErrorActionPreference = 'Continue'
    $output = @(& git -C $At @Arguments 2>&1 | ForEach-Object { "$_" })
    if ($LASTEXITCODE -ne 0) { throw "git $($Arguments -join ' ') failed: $($output -join ' ')" }
    return $output
}
function SaveJson($Value, [string]$Path) { $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding UTF8 }
function Resolve-Predecessor([string]$Base, [bool]$Preview) {
    if ($number -le 1) { return }
    $previous = 'VS-{0:000}' -f ($number-1)
    $path = $PreviousReview
    if (!$path) { $path = '.agent/reviews/'+$previous+'.md' }
    if ([IO.Path]::IsPathRooted($path) -or $path -match '(^|[\\/])\.\.([\\/]|$)|[:*?\[\]]') { throw 'PreviousReview must be a repository-relative evidence path.' }
    $path = $path.Replace('\','/')
    $local = Join-Path $Repository $path
    $tracked = @(Invoke-FirmGit @('ls-tree','--name-only',$Base,'--',$path)).Count -gt 0
    $localEvidence = $Preview -and (Test-Path -LiteralPath $local -PathType Leaf)
    if ($localEvidence -and $tracked) {
        $onMain = (Invoke-FirmGit @('show',($Base+':'+$path))) -join "`n"
        if ((Get-Content -LiteralPath $local -Raw).Trim().Replace("`r`n","`n") -eq $onMain.Trim()) { $localEvidence = $false }
    }
    if ($localEvidence) { $review = Get-Content -LiteralPath $local -Raw }
    elseif ($tracked) { $review = (Invoke-FirmGit @('show',($Base+':'+$path))) -join "`n" }
    elseif (Test-Path -LiteralPath $local -PathType Leaf) {
        # Historical bootstrap evidence is accepted only with an explicit, verified merge.
        $localEvidence = $true
        $review = Get-Content -LiteralPath $local -Raw
    } else { throw "BLOCKED: missing predecessor review: $path" }
    $verdicts = [regex]::Matches($review,'(?im)^Reviewer verdict:\s*\**([^\r\n*]+)\**\s*$|^## Reviewer Verdict\s*\r?\n\s*\r?\n\**([^\r\n*]+)\**\s*$')
    if ($verdicts.Count -ne 1 -or ($verdicts[0].Groups[1].Value+$verdicts[0].Groups[2].Value).Trim() -cne 'PASS') { throw "BLOCKED: invalid predecessor Reviewer PASS: $path" }
    if ($review -notmatch ('(?m)^# '+[regex]::Escape($previous)+'\b')) { throw "BLOCKED: review identity must be $previous." }
    $recorded = [regex]::Match($review,'(?im)^Implementation commit:\s*([0-9a-f]{7,40})\s*$')
    $mergeRecord = [regex]::Match($review,'(?im)^Merged to main via:\s*([0-9a-f]{7,40})\s*$')
    foreach ($field in @('Implementation commit','Merged to main via')) {
        $lines = [regex]::Matches($review,('(?im)^'+[regex]::Escape($field)+':[^\r\n]*$'))
        if ($lines.Count -gt 1 -or ($lines.Count -eq 1 -and $lines[0].Value -notmatch ('^'+[regex]::Escape($field)+':\s*[0-9a-f]{7,40}\s*$'))) { throw "BLOCKED: invalid or duplicate archive metadata: $field" }
    }
    if ($localEvidence -and !$recorded.Success) { throw 'BLOCKED: local historical evidence requires an implementation commit.' }
    $candidateCommit = $PreviousFinalCommit
    if (!$candidateCommit) {
        if ($recorded.Success) { $candidateCommit = $recorded.Groups[1].Value }
        elseif ($tracked -and !$localEvidence) {
            # New archives are committed atomically with their reviewed implementation.
            $candidateCommit = (Invoke-FirmGit @('log','-1','--format=%H',$Base,'--',$path)) -join ''
        } else { throw "BLOCKED: predecessor implementation commit cannot be discovered: $path" }
    }
    $final = (Invoke-FirmGit @('rev-parse',($candidateCommit+'^{commit}'))) -join ''
    if ($recorded.Success -and $final -ne ((Invoke-FirmGit @('rev-parse',($recorded.Groups[1].Value+'^{commit}'))) -join '')) { throw 'BLOCKED: explicit predecessor commit conflicts with approved archive.' }
    $subject = (Invoke-FirmGit @('show','-s','--format=%s',$final)) -join ''
    if ($subject -notmatch ('^feat\(vs-{0:000}\): implement\b' -f ($number-1))) { throw "BLOCKED: predecessor is not an identified $previous implementation commit." }
    $null = Invoke-FirmGit @('merge-base','--is-ancestor',$final,$Base)
    $integration = ''
    foreach ($entry in (Invoke-FirmGit @('rev-list','--first-parent','--reverse',$Base))) {
        & git -C $Repository merge-base --is-ancestor $final $entry 2>$null
        if ($LASTEXITCODE -eq 0) { $integration = $entry; break }
        if ($LASTEXITCODE -ne 1) { throw 'BLOCKED: cannot verify predecessor integration.' }
    }
    if (!$integration) { throw 'BLOCKED: predecessor integration missing from main.' }
    if ($mergeRecord.Success) {
        $merge = (Invoke-FirmGit @('rev-parse',($mergeRecord.Groups[1].Value+'^{commit}'))) -join ''
        if ($merge -ne $integration) { throw 'BLOCKED: historical merge does not match Git history.' }
    } elseif ($localEvidence) { throw 'BLOCKED: local predecessor evidence requires a verified historical merge record.' }
    $script:PreviousReview = $path
    $script:PreviousFinalCommit = $final
    $script:PreviousMergeCommit = $integration
    $script:PreviousReviewText = $review
}
function Snapshot([string]$At) {
    $files = @(Invoke-FirmGit @('ls-files','--cached','--others','--exclude-standard') $At | Sort-Object -Unique)
    $entries = foreach ($file in $files) {
        if ($file -like '.agent/runs/*') { continue }
        $path = Join-Path $At $file
        if (Test-Path -LiteralPath $path -PathType Leaf) { "$file $((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash)" } else { "$file DELETED" }
    }
    return (@(Invoke-FirmGit @('rev-parse','HEAD') $At) + @(Invoke-FirmGit @('diff','--cached') $At) + @($entries)) -join "`n"
}
function Agent([string]$Role, [string]$Sandbox, [string[]]$Verdicts, [string]$Context) {
    $schema = @{type='object'; additionalProperties=$false; properties=@{
        verdict=@{type='string'; enum=$Verdicts}; reason=@{type='string'};
        contract_markdown=@{type='string'}; allowed_files=@{type='array'; items=@{type='string'}}
    }; required=@('verdict','reason','contract_markdown','allowed_files')}
    $schemaPath = Join-Path $run ($Role+'.schema.json')
    SaveJson $schema $schemaPath
    $prompt = Get-Content -LiteralPath (Join-Path $PSScriptRoot ('../prompts/'+$Role+'-vs.md')) -Raw
    $prompt += "`n`nORCHESTRATOR INVOCATION (final response format overrides the reusable prompt's text format):`n$Context`nReturn ONLY schema JSON. Use empty contract_markdown and allowed_files for non-planner roles. Do not alter Invoke-FirmGit HEAD/index or publish. Run directory is handoff data, not new governance."
    if ($Role -eq 'planner') { $prompt += "`nYou are read-only: do NOT write the contract. Return its full validated text in contract_markdown and an exact repository-relative file allowlist in allowed_files. The host saves the contract only on READY. Missing decisions mean BLOCKED. Canonical regression logs must be explicitly included in Allowed Changes and allowed_files if their updates are required. No wildcards or directory allowlists." }
    if ($Smoke) { $prompt = 'Do not inspect or modify files or execute commands. Return verdict READY, reason CODEX_ORCHESTRATOR_SMOKE_OK, empty contract_markdown and empty allowed_files in the provided schema.' }
    $prompt | Set-Content -LiteralPath (Join-Path $run ($Role+'.input.md')) -Encoding UTF8
    $resultPath = Join-Path $run ($Role+'.json')
    $before = Snapshot $wt
    $headBefore = (Invoke-FirmGit @('rev-parse','HEAD') $wt) -join ''
    $savedPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $prompt | & codex exec --ephemeral --sandbox $Sandbox --color never --cd $wt --json --output-schema $schemaPath --output-last-message $resultPath - 2> (Join-Path $run ($Role+'.stderr.log')) | Set-Content -LiteralPath (Join-Path $run ($Role+'.events.jsonl')) -Encoding UTF8
        $code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $savedPreference }
    if ($code -ne 0) { throw "$Role CLI failed. See run logs." }
    if (((Invoke-FirmGit @('rev-parse','HEAD') $wt) -join '') -ne $headBefore -or @(Invoke-FirmGit @('diff','--cached','--name-only') $wt).Count) { throw "$Role changed HEAD/index; stop for manual inspection." }
    if ($Sandbox -eq 'read-only' -and (Snapshot $wt) -ne $before) { throw "$Role changed files despite read-only role." }
    $result = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json
    if ($result.verdict -cnotin $Verdicts -or [string]::IsNullOrWhiteSpace($result.reason)) { throw "$Role returned an invalid verdict." }
    return $result
}
$null = Get-Command git -ErrorAction Stop
$null = Invoke-FirmGit @('check-ref-format','--branch',$Branch)
$worktrees = Invoke-FirmGit @('worktree','list','--porcelain')
$wt = Join-Path $WorktreeRoot $id
$candidate = $null
foreach ($line in $worktrees) {
    if ($line.StartsWith('worktree ')) { $candidate = $line.Substring(9) }
    if ($line -eq "branch refs/heads/$Branch") { $wt = $candidate }
}
if ($DryRun) {
    $previewBase = (Invoke-FirmGit @('rev-parse','main^{commit}')) -join ''
    Resolve-Predecessor $previewBase $true
    Write-Output "DRY RUN $id -> $Branch at $wt"
    Write-Output 'Normal flow: clean-worktree check -> fetch origin main -> previous PASS/final commit gate -> planner read-only -> READY contract -> implementer workspace-write -> regressions + smoke -> reviewer read-only -> PASS archive -> commit. -Publish additionally pushes and creates PR; never merges.'
    Write-Output "Godot: $Godot; previous final commit: $PreviousFinalCommit; previous review: $PreviousReview"
    if ($number -gt 1) { Write-Output "Previous integration on local main: $PreviousMergeCommit (preview only; normal mode fetches origin/main)." }
    return
}
$null = Get-Command codex -ErrorAction Stop
if ($Smoke) { $wt = $Repository }
else {
    $null = Get-Command $Godot -ErrorAction Stop
    if ($Publish) { $null = Get-Command gh -ErrorAction Stop; & gh auth status; if ($LASTEXITCODE) { throw 'gh authentication failed.' } }
    $null = Invoke-FirmGit @('fetch','origin','main')
    $base = (Invoke-FirmGit @('rev-parse','origin/main')) -join ''
    Resolve-Predecessor $base $false
    if (Test-Path -LiteralPath $wt) {
        if ((Invoke-FirmGit @('rev-parse','--show-toplevel') $wt | Out-String).Trim().Replace('\','/') -ne ([IO.Path]::GetFullPath($wt).Replace('\','/'))) { throw 'Target is not a worktree root.' }
        if (((Invoke-FirmGit @('branch','--show-current') $wt) -join '') -ne $Branch) { throw 'Worktree belongs to another branch.' }
        if (@(Invoke-FirmGit @('status','--porcelain') $wt).Count) { throw 'Reuse requires a clean worktree. Preserve/review existing changes manually.' }
        $null = Invoke-FirmGit @('merge-base','--is-ancestor',$base,'HEAD') $wt
        if (@(Invoke-FirmGit @('rev-list',($base+'..HEAD')) $wt).Count) { throw 'Reuse requires HEAD at latest main; existing task commits need manual review.' }
    } else {
        $existing = @(& git -C $Repository show-ref --verify --quiet ('refs/heads/'+$Branch))
        $branchExists = $LASTEXITCODE -eq 0
        if ($branchExists) {
            if (((Invoke-FirmGit @('rev-parse',$Branch)) -join '') -ne $base) { throw 'Existing branch is not at latest main; no reset/rebase is automatic.' }
            $null = Invoke-FirmGit @('worktree','add',$wt,$Branch)
        } else { $null = Invoke-FirmGit @('worktree','add','-b',$Branch,$wt,$base) }
    }
}
$runRoot = Join-Path $wt ('.agent/runs/'+$id)
$null = New-Item -ItemType Directory -Path $runRoot -Force
$lock = $null
try {
    $lock = [IO.File]::Open((Join-Path $runRoot 'run.lock'),[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    $run = Join-Path $runRoot ((Get-Date -Format 'yyyyMMdd-HHmmss')+'-'+[guid]::NewGuid().ToString('N').Substring(0,8))
    $null = New-Item -ItemType Directory -Path $run
    # Exclude handoffs locally without changing tracked ignore/governance files.
    $exclude = (Invoke-FirmGit @('rev-parse','--git-path','info/exclude') $wt) -join ''
    if (![IO.Path]::IsPathRooted($exclude)) { $exclude = Join-Path $wt $exclude }
    if (!(Test-Path -LiteralPath $exclude) -or !(Select-String -LiteralPath $exclude -SimpleMatch '.agent/runs/' -Quiet)) { Add-Content -LiteralPath $exclude -Value "`n.agent/runs/" }
    if ($Smoke) {
        $result = Agent 'planner' 'read-only' @('READY','BLOCKED') ''
        if ($result.verdict -ne 'READY' -or $result.reason -ne 'CODEX_ORCHESTRATOR_SMOKE_OK') { throw 'Smoke verdict invalid.' }
        Write-Output "SMOKE PASS: $run"
        return
    }
    $contractPath = '.agent/tasks/'+$id+'.md'
    $context = "VS: $id`nBranch: $Branch`nLatest main base: $base`nPrevious final commit: $PreviousFinalCommit`nPrevious review: $PreviousReview`nActive contract: $contractPath`nRun directory: $run"
    if ($number -gt 1) {
        $PreviousReviewText | Set-Content -LiteralPath (Join-Path $run 'predecessor-review.md') -Encoding UTF8
        $context += "`nPrevious integration commit: $PreviousMergeCommit`nResolved predecessor evidence (host-validated):`n$PreviousReviewText"
    }
    SaveJson @{vs=$id;branch=$Branch;worktree=$wt;base=$base;previous_final_commit=$PreviousFinalCommit;previous_review=$PreviousReview;publish=[bool]$Publish} (Join-Path $run 'invocation.json')
    $plan = Agent 'planner' 'read-only' @('READY','BLOCKED') $context
    if ($plan.verdict -ne 'READY') { throw "BLOCKED: $($plan.reason)" }
    if ([string]::IsNullOrWhiteSpace($plan.contract_markdown) -or !@($plan.allowed_files).Count) { throw 'Planner READY lacks contract/allowlist.' }
    foreach ($file in $plan.allowed_files) {
        if ([IO.Path]::IsPathRooted($file) -or $file -match '[\\:*?\[\]]|(^|/)\.\.(/|$)' -or $file -like '.agent/runs/*' -or $file -in @('AGENTS.md','WORKFLOW.md',$contractPath) -or $file -like '.agent/scripts/*' -or $file -like '.agent/prompts/*') { throw "Invalid implementation allowlist entry: $file" }
    }
    $null = New-Item -ItemType Directory -Path (Join-Path $wt '.agent/tasks') -Force
    $plan.contract_markdown.TrimEnd() | Set-Content -LiteralPath (Join-Path $wt $contractPath) -Encoding UTF8
    Copy-Item -LiteralPath (Join-Path $wt $contractPath) -Destination (Join-Path $run 'contract.md')
    $contractHash = (Get-FileHash -LiteralPath (Join-Path $wt $contractPath)).Hash
    $implementation = Agent 'implementer' 'workspace-write' @('READY','BLOCKED') $context
    if ($implementation.verdict -ne 'READY') { throw "BLOCKED: $($implementation.reason)" }
    if ((Get-FileHash -LiteralPath (Join-Path $wt $contractPath)).Hash -ne $contractHash) { throw 'Implementer changed frozen contract.' }
    & (Join-Path $PSScriptRoot 'test-vs.ps1') -Worktree $wt -VS $number -RunDirectory $run -Godot $Godot
    $changed = @(Invoke-FirmGit @('diff','--name-only',$base) $wt) + @(Invoke-FirmGit @('ls-files','--others','--exclude-standard') $wt)
    $allowed = @($plan.allowed_files) + @($contractPath)
    foreach ($file in $changed) { if ($file -cnotin $allowed) { throw "FIX REQUIRED: out-of-scope change: $file" } }
    $null = Invoke-FirmGit @('diff','--check') $wt
    $reviewer = Agent 'reviewer' 'read-only' @('PASS','FIX REQUIRED','BLOCKED') $context
    if ($reviewer.verdict -ne 'PASS') { throw "$($reviewer.verdict): $($reviewer.reason)" }
    $packet = Join-Path $wt 'litigation-skeleton/REVIEW_PACKET.md'
    if (!(Test-Path -LiteralPath $packet)) { throw 'Review packet missing.' }
    $archive = '.agent/reviews/'+$id+'.md'
    $null = New-Item -ItemType Directory -Path (Join-Path $wt '.agent/reviews') -Force
    # Keep approved evidence in the same implementation commit: its own SHA cannot
    # be embedded here without a self-reference/history rewrite. Discovery uses Git.
    "# $id Review Archive`n`nReviewer verdict: PASS`nReason: $($reviewer.reason)`nImplementation evidence: the Git commit containing this archive`nMain base: $base`nRun: $run`n`n" + (Get-Content -LiteralPath $packet -Raw).TrimEnd() | Set-Content -LiteralPath (Join-Path $wt $archive) -Encoding UTF8
    $changed = @($changed + $archive | Sort-Object -Unique)
    $null = Invoke-FirmGit (@('add','--')+$changed) $wt
    $null = Invoke-FirmGit @('diff','--cached','--check') $wt
    $null = Invoke-FirmGit @('commit','-m',("feat(vs-{0:000}): implement contracted vertical slice" -f $number)) $wt
    $commit = (Invoke-FirmGit @('rev-parse','HEAD') $wt) -join ''
    SaveJson @{verdict='PASS';commit=$commit;published=$false} (Join-Path $run 'completion.json')
    if ($Publish) {
        $null = Invoke-FirmGit @('push','--set-upstream','origin',$Branch) $wt
        Copy-Item -LiteralPath $packet -Destination (Join-Path $run 'pr-body.md')
        Push-Location $wt
        try { & gh pr create --base main --head $Branch --title "$id implementation" --body-file (Join-Path $run 'pr-body.md') | Set-Content -LiteralPath (Join-Path $run 'pr-url.txt'); if ($LASTEXITCODE) { throw 'PR creation failed; commit/push preserved, do not blindly rerun implementation.' } } finally { Pop-Location }
        SaveJson @{verdict='PASS';commit=$commit;published=$true} (Join-Path $run 'completion.json')
    }
    Write-Output "PASS: $commit; handoff: $run"
} catch {
    if (Get-Variable run -ErrorAction SilentlyContinue) { SaveJson @{verdict='STOPPED';reason=$_.Exception.Message} (Join-Path $run 'stopped.json') }
    throw
} finally { if ($lock) { $lock.Dispose() } }
