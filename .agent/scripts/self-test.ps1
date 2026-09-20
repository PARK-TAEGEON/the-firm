# Offline orchestration checks: real local Git worktrees, fake Codex/Godot.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('firm-orchestrator-test-'+[guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $fixtureRoot
$scriptPath = Join-Path $PSScriptRoot 'start-vs.ps1'
$global:firmMockMode = 'PASS'
$global:firmMockCalls = @()
$global:firmInterruptImplementer=$false
function AssertMachineJson([string]$Path) {
    $bytes = [IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { throw "UTF-8 BOM: $Path" }
    $text = [Text.UTF8Encoding]::new($false, $true).GetString($bytes)
    if ([string]::IsNullOrWhiteSpace($text)) {
        if ([IO.Path]::GetExtension($Path) -eq '.jsonl') { return } # zero events before power loss is valid JSONL
        throw "Empty JSON: $Path"
    }
    if ([IO.Path]::GetExtension($Path) -eq '.jsonl') {
        foreach ($line in ($text -split '\r?\n')) { if ($line.Trim()) { $null = $line | ConvertFrom-Json -ErrorAction Stop } }
    } else { $null = $text | ConvertFrom-Json -ErrorAction Stop }
}
function global:firmMockGodot {
    if ($global:firmMockMode -eq 'TEST_FAIL') { 'SUMMARY 3 checks, 1 failures'; $global:LASTEXITCODE=1 }
    elseif ($args -contains '--script') { 'SUMMARY 3 checks, 0 failures'; $global:LASTEXITCODE=0 }
    else { 'Godot smoke'; $global:LASTEXITCODE=0 }
}
function global:codex {
    begin { $a=@($args); $inputText='' }
    process { $inputText += "$_`n" }
    end {
        $resultPath=$a[[array]::IndexOf($a,'--output-last-message')+1]
        AssertMachineJson $a[[array]::IndexOf($a,'--output-schema')+1]
        $at=$a[[array]::IndexOf($a,'--cd')+1]
        $role=[IO.Path]::GetFileNameWithoutExtension($resultPath)
        $global:firmMockCalls += $role
        $plannerCount = @($global:firmMockCalls | Where-Object { $_ -eq 'planner' }).Count
        $reviewCount = @($global:firmMockCalls | Where-Object { $_ -eq 'reviewer' }).Count
        $result=@{verdict='READY';reason='fixture';contract_markdown='';allowed_files=@()}
        if ($role -eq 'blocker-classifier') {
            if ($a[[array]::IndexOf($a,'--sandbox')+1] -ne 'read-only' -or $inputText -notmatch 'source_sha256') { throw 'Classifier must be read-only with bound evidence.' }
            $result=@{verdict=($global:firmMockMode -replace '^LEGACY_','');reason='fixture: cited saved result + contract + Accepted header contradiction'}
        }
        if ($role -eq 'implementer') { $result.blocker_kind='none' }
        if ($inputText -match 'Do not inspect or modify') { $result.reason='CODEX_ORCHESTRATOR_SMOKE_OK'; $result.blocker_kind='none' }
        elseif ($role -eq 'blocker-classifier') { }
        elseif ($role -eq 'planner') {
            $result.blocker_kind='none'
            $result.contract_markdown="# VS-001 fixture contract READY revision $plannerCount"
            $result.allowed_files=@('litigation-skeleton/REVIEW_PACKET.md')
            if ($global:firmMockMode -eq 'IMPL_UNRESOLVED' -and $plannerCount -gt 1) { $result.verdict='BLOCKED'; $result.blocker_kind='design_closure' }
            if ($global:firmMockMode -eq 'IMPL_EXISTING' -and $plannerCount -eq 1) { $result.verdict='BLOCKED'; $result.blocker_kind='design_closure' }
            if ($global:firmMockMode -eq 'PLANNER_BLOCKED') { $result.verdict='BLOCKED'; $result.blocker_kind='other' }
            if ($global:firmMockMode -like 'DESIGN_*' -and ($global:firmMockMode -ne 'DESIGN_SUCCESS' -or $plannerCount -eq 1)) {
                $result.verdict='BLOCKED'; $result.reason='Missing Accepted design closure'; $result.blocker_kind='design_closure'
            }
        } elseif ($role -eq 'design-closure') {
            $sandbox=$a[[array]::IndexOf($a,'--sandbox')+1]
            if ($sandbox -ne 'workspace-write') { throw 'Closure sandbox incorrect.' }
            $null=New-Item -ItemType Directory -Path (Join-Path $at '.agent/plans') -Force
            "# Closure fixture $plannerCount" | Set-Content (Join-Path $at $(if (($global:firmMockMode -like 'IMPL_*' -or $global:firmMockMode -like 'LEGACY_*')) { '.agent/plans/VS-001-design.md' } else { '.agent/plans/closure.md' }))
            if ($global:firmMockMode -eq 'IMPL_UNRESOLVED') { $result.verdict='BLOCKED' }
            if ($global:firmMockMode -eq 'DESIGN_REPEAT') { $result.verdict='BLOCKED' }
            if ($global:firmMockMode -eq 'DESIGN_SCOPE') { 'unauthorized' | Set-Content (Join-Path $at 'litigation-skeleton/tests/run_regressions.gd') }
            if ($global:firmMockMode -eq 'DESIGN_IGNORED_SCOPE') { 'unauthorized' | Set-Content (Join-Path $at 'ignored.gd') }
            if ($global:firmMockMode -eq 'DESIGN_DELETE_SCOPE') { Remove-Item -LiteralPath (Join-Path $at 'litigation-skeleton/tests/run_regressions.gd') }
        } elseif ($role -eq 'implementer') {
            if ($global:firmInterruptImplementer) { $global:firmInterruptImplementer=$false; throw 'fixture power loss' }
            if ($global:firmMockMode -eq 'IMPL_SUCCESS' -and @($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -gt 1) {
                if ((Get-Content -LiteralPath (Join-Path $at '.agent/tasks/VS-001.md') -Raw) -notmatch 'revision 2') { throw 'Restart did not receive the revised validated contract.' }
            }
            if ($global:firmMockMode -ne 'PARTIAL_PENDING') { 'Fixture implementation packet' | Set-Content (Join-Path $at 'litigation-skeleton/REVIEW_PACKET.md') }
            if ($global:firmMockMode -eq 'SCOPE_FAIL') { 'unauthorized' | Set-Content (Join-Path $at 'forbidden.txt') }
            if ($global:firmMockMode -eq 'IMPLEMENTER_BLOCKED') { $result.verdict='BLOCKED'; $result.blocker_kind='other' }
            $implCount=@($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count
            if ($global:firmMockMode -in @('IMPL_SUCCESS','IMPL_REPEAT','IMPL_INFRA','IMPL_CLI','IMPL_UNRESOLVED','IMPL_EXISTING') -and ($implCount -eq 1 -or $global:firmMockMode -eq 'IMPL_REPEAT')) {
                $result.verdict='BLOCKED'; $result.blocker_kind='design_closure'; $result.reason='Accepted design requires provenance but contract forbids the source service change.'
                if ($global:firmMockMode -eq 'IMPL_INFRA') { $result.reason='sandbox apply deny-read ACL error' }
                if ($global:firmMockMode -eq 'IMPL_CLI') { $global:LASTEXITCODE=1; return }
            }
        } else {
            $result.verdict=if ($global:firmMockMode -eq 'FIX REQUIRED') { 'FIX REQUIRED' } elseif ($global:firmMockMode -eq 'FIX_SUCCESS' -and $reviewCount -eq 1) { 'FIX REQUIRED' } elseif ($global:firmMockMode -eq 'REVIEWER_BLOCKED') { 'BLOCKED' } else { 'PASS' }
        }
        [IO.File]::WriteAllText($resultPath, ($result | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
        '{"fixture":true}'
        if ($global:firmMockMode -in @('PARTIAL_READY','PARTIAL_PENDING') -and $role -eq 'implementer') { '{"type":"thread.error","message":"cut'; $global:LASTEXITCODE=1; return }
        $global:LASTEXITCODE=0
    }
}
function Fixture([string]$Name) {
    $source=Join-Path $fixtureRoot ($Name+'-source')
    $repo=Join-Path $fixtureRoot ($Name+'-repo')
    $null=New-Item -ItemType Directory -Path (Join-Path $source 'litigation-skeleton/tests'),(Join-Path $source 'litigation-skeleton/vertical_slice/tests') -Force
    'fixture' | Set-Content (Join-Path $source 'litigation-skeleton/tests/run_regressions.gd')
    'fixture' | Set-Content (Join-Path $source 'litigation-skeleton/vertical_slice/tests/run_slice_regressions.gd')
    'ignored.gd' | Set-Content (Join-Path $source '.gitignore')
    'initial packet' | Set-Content (Join-Path $source 'litigation-skeleton/REVIEW_PACKET.md')
    & git init -q -b main $source
    & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid add .
    & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid commit -q -m fixture
    & git clone -q $source $repo
    & git -C $repo config user.name Fixture
    & git -C $repo config user.email fixture@example.invalid
    return $repo
}
try {
    $bomFixture = Join-Path $fixtureRoot 'bom-negative.json'
    [IO.File]::WriteAllText($bomFixture, '{"fixture":true}', [Text.UTF8Encoding]::new($true))
    $rejected = $false
    try { AssertMachineJson $bomFixture } catch { if ($_.Exception.Message -notlike 'UTF-8 BOM:*') { throw }; $rejected = $true }
    if (!$rejected) { throw 'BOM assertion accepted a BOM fixture.' }
    Remove-Item -LiteralPath $bomFixture
    $invalidFixture = Join-Path $fixtureRoot 'invalid-negative.json'
    [IO.File]::WriteAllText($invalidFixture, '{invalid', [Text.UTF8Encoding]::new($false))
    $rejected = $false
    try { AssertMachineJson $invalidFixture } catch { $rejected = $true }
    if (!$rejected) { throw 'JSON assertion accepted malformed JSON.' }
    Remove-Item -LiteralPath $invalidFixture
    'PASS fixture: BOM + malformed JSON rejection'
    foreach ($mode in @('PASS','PLANNER_BLOCKED','IMPLEMENTER_BLOCKED','TEST_FAIL','FIX REQUIRED','REVIEWER_BLOCKED','SCOPE_FAIL','DESIGN_SUCCESS','DESIGN_REPEAT','DESIGN_SCOPE','DESIGN_IGNORED_SCOPE','DESIGN_DELETE_SCOPE','FIX_SUCCESS','IMPL_SUCCESS','IMPL_REPEAT','IMPL_INFRA','IMPL_CLI','IMPL_UNRESOLVED','PARTIAL_READY')) {
        $repo=Fixture ($mode -replace ' ','-')
        $global:firmMockMode=$mode
        $global:firmMockCalls=@()
        $failed=$false
        $failureReason=''
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot $mode) -Godot firmMockGodot | Out-Null } catch { $failed=$true; $failureReason=$_.Exception.Message; Write-Verbose $failureReason }
        $success = $mode -in @('PASS','DESIGN_SUCCESS','FIX_SUCCESS','IMPL_SUCCESS','PARTIAL_READY')
        if ($success -and $failed) { throw "PASS fixture unexpectedly failed: $failureReason" }
        if (!$success -and !$failed) { throw "$mode did not stop." }
        $count=[int](& git -C $repo rev-list --count main..task/vs-001)
        if ($count -ne $(if ($success) {1} else {0})) { throw "$mode violated commit gate." }
        if ($mode -in @('PLANNER_BLOCKED','IMPLEMENTER_BLOCKED','TEST_FAIL','SCOPE_FAIL') -and $global:firmMockCalls -contains 'reviewer') { throw "$mode advanced to Reviewer." }
        if ($mode -eq 'PLANNER_BLOCKED' -and $global:firmMockCalls -contains 'implementer') { throw 'BLOCKED advanced to Implementer.' }
        if ($mode -like 'DESIGN_*') {
            if ($mode -like '*SCOPE' -and $failureReason -notlike 'BLOCKED: design-closure scope violation:*') { throw "$mode stopped for the wrong reason: $failureReason" }
            $expected = if ($mode -eq 'DESIGN_REPEAT') {2} else {1}
            if (@($global:firmMockCalls | Where-Object { $_ -eq 'design-closure' }).Count -ne $expected) { throw "$mode closure bound incorrect." }
            if ($mode -ne 'DESIGN_SUCCESS' -and $global:firmMockCalls -contains 'implementer') { throw "$mode advanced to implementation." }
            if ($mode -eq 'DESIGN_REPEAT' -and @($global:firmMockCalls | Where-Object { $_ -eq 'planner' }).Count -ne 3) { throw 'Repeated BLOCKED did not rerun Planner twice.' }
        }
        if ($mode -in @('FIX REQUIRED','FIX_SUCCESS')) {
            $expected = if ($mode -eq 'FIX_SUCCESS') {2} else {3}
            if (@($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne $expected -or @($global:firmMockCalls | Where-Object { $_ -eq 'reviewer' }).Count -ne $expected) { throw "$mode fix bound incorrect." }
            $fixTests = @(Get-ChildItem -Path (Join-Path $fixtureRoot "$mode/VS-001/.agent/runs/VS-001/*/review-fix-*/tests.json"))
            if ($fixTests.Count -ne ($expected-1)) { throw "$mode did not retest each fix." }
        }
        if ($mode -like 'IMPL_*') {
            $expected=if ($mode -eq 'IMPL_SUCCESS') {1} elseif ($mode -in @('IMPL_REPEAT','IMPL_UNRESOLVED','PARTIAL_READY')) {2} else {0}
            if (@($global:firmMockCalls | Where-Object { $_ -eq 'design-closure' }).Count -ne $expected) { throw "$mode implementation correction count wrong." }
            if ($mode -eq 'IMPL_SUCCESS' -and ($global:firmMockCalls -join ',') -ne 'planner,implementer,design-closure,planner,implementer,reviewer') { throw 'Implementation correction ordering wrong.' }
            if ($mode -ne 'IMPL_SUCCESS' -and $global:firmMockCalls -contains 'reviewer') { throw "$mode reached Reviewer." }
            if ($mode -eq 'IMPL_SUCCESS') {
                $evidence=(Get-ChildItem -LiteralPath (Join-Path $fixtureRoot 'IMPL_SUCCESS/VS-001/.agent/runs/VS-001') -Directory)[0].FullName
                $old=Get-Content -LiteralPath (Join-Path $evidence 'implementer.json') -Raw | ConvertFrom-Json
                $new=Get-Content -LiteralPath (Join-Path $evidence 'implementation-design-1/implementer.json') -Raw | ConvertFrom-Json
                if ($old.verdict -ne 'BLOCKED' -or $new.verdict -ne 'READY') { throw 'Correction overwrote previous verdict evidence.' }
                if ((Get-Content -LiteralPath (Join-Path $evidence 'contract.md') -Raw) -notmatch 'revision 1' -or (Get-Content -LiteralPath (Join-Path $evidence 'implementation-design-1/contract.md') -Raw) -notmatch 'revision 2') { throw 'Contract revisions not preserved.' }
            }
            if ($mode -eq 'IMPL_INFRA' -and $failureReason -notlike 'BLOCKED:*') { throw 'Infrastructure classification wrong.' }
        }
        "PASS fixture: $mode"
        if ($mode -eq 'PARTIAL_READY') {
            $calls=$global:firmMockCalls -join ','
            $wt=Join-Path $fixtureRoot 'PARTIAL_READY/VS-001'
            $evidence=(Get-ChildItem (Join-Path $wt '.agent/runs/VS-001') -Directory)[0].FullName
            $diag=Get-Content (Join-Path $evidence 'implementer.diagnostics.json') -Raw | ConvertFrom-Json
            if (!$diag.event_stream_partial -or !$diag.authoritative_result_valid -or $diag.process_exit -ne 1) { throw 'Partial result diagnostic wrong' }
            & $scriptPath -VS 001 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot $mode) -Godot firmMockGodot -Resume | Out-Null
            & $scriptPath -VS 001 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot $mode) -Godot firmMockGodot -Resume | Out-Null
            if (($global:firmMockCalls -join ',') -ne $calls -or [int](& git -C $repo rev-list --count main..task/vs-001) -ne 1) { throw 'Partial result resume reran completed work' }
            'PASS fixture: partial final JSONL + nonzero exit + repeated resume idempotence'
        }
        if ($mode -eq 'PASS') {
            $archive = (& git -C $repo show 'task/vs-001:.agent/reviews/VS-001.md') -join "`n"
            if ($archive -notmatch 'Reviewer verdict: PASS') { throw 'PASS archive was not committed.' }
            # Publish only to the disposable local fixture remote, then merge there.
            $source = Join-Path $fixtureRoot 'PASS-source'
            & git -C $source fetch -q $repo task/vs-001
            & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid merge -q --no-ff FETCH_HEAD -m 'fixture integration'
            & git -C $repo fetch -q origin main
            & git -C $repo merge -q --ff-only origin/main
            $final = (& git -C $repo rev-parse task/vs-001) -join ''
            $preview = (& $scriptPath -VS 002 -Repository $repo -DryRun) -join "`n"
            if ($preview -notmatch [regex]::Escape($final) -or $preview -notmatch '.agent/reviews/VS-001.md') { throw 'Automatic predecessor discovery failed.' }
            $global:firmMockMode='PLANNER_BLOCKED'
            $global:firmMockCalls=@()
            try { & $scriptPath -VS 002 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot 'automatic-next') -Godot firmMockGodot | Out-Null } catch {
                if ($_.Exception.Message -notmatch 'BLOCKED: (\[other\] )?fixture') { throw }
            }
            if ($global:firmMockCalls -notcontains 'planner' -or $global:firmMockCalls -contains 'implementer') { throw 'Automatic normal-mode gate failed.' }
            'PASS fixture: persisted archive + automatic predecessor + normal gate'
        }
    }
    # Exercise ancestry directly using the same functions as the orchestrator.
    $ast = [Management.Automation.Language.Parser]::ParseFile($scriptPath, [ref]$null, [ref]$null)
    foreach ($name in @('Invoke-FirmGitResult','Invoke-FirmGit','Test-FirmAncestor')) {
        $definition = $ast.Find({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name }, $true)
        Invoke-Expression $definition.Extent.Text
    }
    $repo=Fixture 'ancestry'
    $initial=(& git -C $repo rev-parse HEAD) -join ''
    if (!(Test-FirmAncestor $initial $initial $repo)) { throw 'Ancestor true rejected.' }
    $source=Join-Path $fixtureRoot 'ancestry-source'
    'advance' | Set-Content (Join-Path $source 'advance.txt')
    & git -C $source add .
    & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid commit -q -m advance
    & git -C $repo fetch -q origin main
    $latest=(& git -C $repo rev-parse origin/main) -join ''
    if (!(Test-FirmAncestor $initial $latest $repo) -or (Test-FirmAncestor $latest $initial $repo)) { throw 'Ancestor true/false handling failed.' }
    $rejected=$false
    try { Test-FirmAncestor 'missing-commit' $latest $repo | Out-Null } catch { $rejected=$_.Exception.Message -like 'BLOCKED: git merge-base*exit*' }
    if (!$rejected) { throw 'Unexpected ancestry exit did not throw.' }
    'PASS fixture: ancestor true + false + unexpected exit'
    foreach ($case in @('CLEAN','STAGED','UNSTAGED','UNTRACKED','AHEAD','DIVERGED','CURRENT')) {
        $repo=Fixture ('sync-'+$case)
        $source=Join-Path $fixtureRoot ('sync-'+$case+'-source')
        $root=Join-Path $fixtureRoot ('sync-'+$case+'-worktrees')
        $wt=Join-Path $root 'VS-001'
        & git -C $repo worktree add -q -b task/vs-001 $wt main
        if ($case -in @('AHEAD','DIVERGED')) {
            'task commit' | Set-Content (Join-Path $wt 'task.txt')
            & git -C $wt add .
            & git -C $wt commit -q -m 'task work'
        }
        if ($case -notin @('AHEAD','CURRENT')) {
            'advance' | Set-Content (Join-Path $source 'advance.txt')
            & git -C $source add .
            & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid commit -q -m 'latest base'
        }
        if ($case -in @('STAGED','UNSTAGED')) {
            'user changes' | Set-Content (Join-Path $wt 'litigation-skeleton/REVIEW_PACKET.md')
            if ($case -eq 'STAGED') { & git -C $wt add . }
        }
        if ($case -eq 'UNTRACKED') { 'user file' | Set-Content (Join-Path $wt 'user.txt') }
        $headBefore=(& git -C $wt rev-parse HEAD) -join ''
        $statusBefore=(& git -C $wt status --porcelain) -join "`n"
        $diffBefore=((& git -C $wt diff) + (& git -C $wt diff --cached)) -join "`n"
        $global:firmMockMode='PLANNER_BLOCKED'
        $global:firmMockCalls=@()
        $reason=''
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { $reason=$_.Exception.Message }
        if ($case -in @('CLEAN','CURRENT')) {
            $latest=(& git -C $repo rev-parse origin/main) -join ''
            if (((& git -C $wt rev-parse HEAD) -join '') -ne $latest -or $reason -notmatch '^BLOCKED: (\[other\] )?fixture' -or ($global:firmMockCalls -join ',') -ne 'planner') { throw "$case did not reach Planner at latest main: $reason" }
        } else {
            if ($reason -notlike 'BLOCKED: worktree*' -or $global:firmMockCalls.Count) { throw "$case did not refuse before agents: $reason" }
            if (((& git -C $wt rev-parse HEAD) -join '') -ne $headBefore -or ((& git -C $wt status --porcelain) -join "`n") -ne $statusBefore -or (((& git -C $wt diff)+(& git -C $wt diff --cached)) -join "`n") -ne $diffBefore) { throw "$case changed HEAD/index/files on refusal." }
            if ($case -eq 'UNTRACKED' -and (Get-Content (Join-Path $wt 'user.txt') -Raw).Trim() -ne 'user file') { throw 'Untracked content changed.' }
        }
        "PASS fixture: worktree $case"
    }
    $repo=Fixture 'preview'
    $before=(& git -C $repo worktree list --porcelain) -join "`n"
    & $scriptPath -VS 001 -Repository $repo -DryRun | Out-Null
    & $scriptPath -VS 001 -Repository $repo -Smoke | Out-Null
    if ((& git -C $repo worktree list --porcelain) -join "`n" -ne $before) { throw 'Preview created worktree.' }
    if (@(& git -C $repo status --porcelain).Count) { throw 'Smoke polluted Git status.' }
    'PASS fixture: dry-run + smoke'
    $failed=$false
    try { & $scriptPath -VS 002 -Repository $repo -Godot firmMockGodot | Out-Null } catch { $failed=$true; if ($mode -eq 'PASS') { Write-Host $_.Exception.Message } }
    if (!$failed) { throw 'Missing predecessor commit did not block.' }
    'PASS fixture: predecessor gate'
    $repo=Fixture 'historical'
    $source=Join-Path $fixtureRoot 'historical-source'
    'implementation' | Set-Content (Join-Path $source 'implementation.txt')
    & git -C $source add .
    & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid commit -q -m 'feat(vs-001): implement historical fixture'
    $final=(& git -C $source rev-parse HEAD) -join ''
    & git -C $repo fetch -q origin main
    & git -C $repo merge -q --ff-only origin/main
    $null=New-Item -ItemType Directory -Path (Join-Path $repo '.agent/reviews') -Force
    $reviewPath=Join-Path $repo '.agent/reviews/VS-001.md'
    $valid="# VS-001 Historical Review Archive`n`nReviewer Verdict: PASS`nImplementation commit: $final`nMerged to main via: $final`n"
    $valid | Set-Content $reviewPath
    & $scriptPath -VS 002 -Repository $repo -DryRun | Out-Null
    $global:firmMockMode='PLANNER_BLOCKED'
    $global:firmMockCalls=@()
    try { & $scriptPath -VS 002 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot 'historical-next') -Godot firmMockGodot | Out-Null } catch { if ($_.Exception.Message -notmatch 'BLOCKED: (\[other\] )?fixture') { throw } }
    if ($global:firmMockCalls -notcontains 'planner') { throw 'Historical bootstrap did not reach planner.' }
    foreach ($case in @('INVALID_PASS','CONFLICTING_PASS','MISSING_MERGE','WRONG_MERGE','UNMERGED','DESIGN_COMMIT','OVERRIDE','TRAVERSAL')) {
        $text=$valid
        $extra=@{}
        switch ($case) {
            'INVALID_PASS' { $text=$valid.Replace('Verdict: PASS','Verdict: FIX REQUIRED') }
            'CONFLICTING_PASS' { $text=$valid+"`nReviewer Verdict: BLOCKED`n" }
            'MISSING_MERGE' { $text=$valid -replace '(?m)^Merged to main via:.*','' }
            'WRONG_MERGE' { $initial=(& git -C $repo rev-parse main~1) -join ''; $text=$valid.Replace("Merged to main via: $final","Merged to main via: $initial") }
            'UNMERGED' {
                'unmerged' | Set-Content (Join-Path $source 'implementation.txt')
                & git -C $source add .
                & git -C $source -c user.name=Fixture -c user.email=fixture@example.invalid commit -q -m 'feat(vs-001): implement unmerged fixture'
                & git -C $repo fetch -q origin main
                $unmerged=(& git -C $repo rev-parse origin/main) -join ''
                $text=$valid.Replace($final,$unmerged)
            }
            'DESIGN_COMMIT' { $initial=(& git -C $repo rev-parse main~1) -join ''; $text=$valid.Replace($final,$initial) }
            'OVERRIDE' { $extra=@{PreviousFinalCommit='main~1'} }
            'TRAVERSAL' { $extra=@{PreviousReview='../review.md'} }
        }
        $text | Set-Content $reviewPath
        $failed=$false
        $global:firmMockCalls=@()
        try { & $scriptPath -VS 002 -Repository $repo -DryRun @extra | Out-Null } catch { $failed=$true }
        if (!$failed -or $global:firmMockCalls.Count) { throw "$case predecessor did not stop before agents." }
        "PASS fixture: predecessor $case"
    }
    $valid | Set-Content $reviewPath
    & $scriptPath -VS 002 -Repository $repo -DryRun -PreviousFinalCommit $final -PreviousReview '.agent/reviews/VS-001.md' | Out-Null
    'PASS fixture: historical archive + explicit overrides'

    foreach ($stage in @('implementation-design-1/design-closure','implementation-design-1/planner','implementation-design-1/contract','implementation-design-1/implementer','design-closure-1/design-closure','design-closure-1/planner','implementer','tests','reviewer','commit-intent','committed-uncheckpointed','completion')) {
        $repo=Fixture ('resume-'+$stage.Replace('/','-'))
        $root=Join-Path $fixtureRoot ('resume-'+$stage.Replace('/','-')+'-wt')
        $global:firmMockMode=if ($stage -like 'implementation-design-*') { 'IMPL_EXISTING' } else { 'DESIGN_SUCCESS' }; $global:firmMockCalls=@()
        $global:firmCrashStage=$stage
        function global:firmCheckpointHook([string]$key) { if ($key -eq $global:firmCrashStage) { throw 'fixture power loss' } }
        $failed=$false
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { $failed=$_.Exception.Message -eq 'fixture power loss' }
        Remove-Item Function:\firmCheckpointHook
        if (!$failed) { throw "Fault injection missed $stage" }
        & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
        if ([int](& git -C $repo rev-list --count main..task/vs-001) -ne 1) { throw "Resume double commit: $stage" }
        $calls=@($global:firmMockCalls)
        & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
        if (($global:firmMockCalls -join ',') -ne ($calls -join ',') -or [int](& git -C $repo rev-list --count main..task/vs-001) -ne 1) { throw "Repeated resume was not idempotent: $stage" }
        if (@($global:firmMockCalls | Where-Object { $_ -eq 'design-closure' }).Count -ne $(if ($stage -like 'implementation-design-*') {2} else {1}) -or @($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne $(if ($stage -like 'implementation-design-*') {2} else {1})) { throw "Resume replayed completed work: $stage" }
        "PASS fixture: interruption $stage + repeated resume"
    }
    foreach ($case in @('CHECKPOINT','HASH','UNKNOWN')) {
        $repo=Fixture ('tamper-'+$case); $root=Join-Path $fixtureRoot ('tamper-'+$case+'-wt')
        $global:firmMockMode='PASS'; $global:firmMockCalls=@()
        function global:firmCheckpointHook([string]$key) { if ($key -eq 'contract') { throw 'fixture power loss' } }
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { if ($_.Exception.Message -ne 'fixture power loss') { throw } }
        Remove-Item Function:\firmCheckpointHook
        $wt=Join-Path $root 'VS-001'; $run=(Get-ChildItem -LiteralPath (Join-Path $wt '.agent/runs/VS-001') -Directory)[0].FullName
        switch ($case) {
            'CHECKPOINT' { Add-Content -LiteralPath (Join-Path $run 'checkpoint.json') -Value ' ' }
            'HASH' { Add-Content -LiteralPath (Join-Path $wt '.agent/tasks/VS-001.md') -Value 'tampered' }
            'UNKNOWN' { 'user data' | Set-Content -LiteralPath (Join-Path $wt 'unknown.txt') }
        }
        $status=(& git -C $wt status --porcelain) -join [Environment]::NewLine; $calls=$global:firmMockCalls -join ','
        $blocked=$false
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null } catch { $blocked=$_.Exception.Message -like 'BLOCKED:*' }
        if (!$blocked -or ($global:firmMockCalls -join ',') -ne $calls -or ((& git -C $wt status --porcelain) -join [Environment]::NewLine) -ne $status) { throw "Tamper refusal failed: $case" }
        "PASS fixture: resume refuses $case without changing worktree"
    }


    $repo=Fixture 'resume-logs'; $root=Join-Path $fixtureRoot 'resume-logs-wt'
    $global:firmMockMode='PASS'; $global:firmMockCalls=@(); $global:firmInterruptImplementer=$true
    $failed=$false
    try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { $failed=$_.Exception.Message -like 'INFRASTRUCTURE: implementer authoritative result missing/invalid:*' }
    if (!$failed) { throw 'Pending Implementer fault injection missed.' }
    $wt=Join-Path $root 'VS-001'; $run=(Get-ChildItem -LiteralPath (Join-Path $wt '.agent/runs/VS-001') -Directory)[0].FullName
    $hashes=@{}
    foreach ($name in @('implementer.input.md','implementer.schema.json','implementer.events.jsonl','implementer.stderr.log')) { $hashes[$name]=(Get-FileHash -LiteralPath (Join-Path $run $name)).Hash }
    & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
    foreach ($name in $hashes.Keys) { if ((Get-FileHash -LiteralPath (Join-Path $run $name)).Hash -ne $hashes[$name]) { throw "Overwrote interrupted log $name" } }
    if (!(Get-ChildItem -LiteralPath $run -Directory | Where-Object Name -like 'resumed-implementer-*')) { throw 'Missing separate resumed diagnostics.' }
    'PASS fixture: pending Implementer restart preserves original diagnostics'
    $repo=Fixture 'partial-pending'; $root=Join-Path $fixtureRoot 'partial-pending-wt'
    $global:firmMockMode='PARTIAL_PENDING'; $global:firmMockCalls=@()
    function global:firmRoleResultHook([string]$role) { if ($role -eq 'implementer') { throw 'fixture power loss' } }
    $failed=$false
    try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { $failed=$_.Exception.Message -eq 'fixture power loss' }
    Remove-Item Function:\firmRoleResultHook
    if (!$failed) { throw 'Uncheckpointed valid result fault missed' }
    & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
    & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
    if (@($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne 1) { throw 'Recovered completed Implementer reran' }
    'PASS fixture: uncheckpointed valid result + partial stream + repeated resume'
    $repo=Fixture 'resume-publish'; $root=Join-Path $fixtureRoot 'resume-publish-wt'
    $global:firmMockMode='PASS'; $global:firmMockCalls=@()
    $global:firmPrCreates=0; $global:firmPrExists=$false
    function global:gh {
        if ($args[0] -eq 'auth') { $global:LASTEXITCODE=0; return }
        if ($args[1] -eq 'list') { if ($global:firmPrExists) { 'https://fixture.invalid/pull/1' }; $global:LASTEXITCODE=0; return }
        if ($args[1] -eq 'create') { $global:firmPrCreates++; $global:firmPrExists=$true; 'https://fixture.invalid/pull/1'; $global:LASTEXITCODE=1; return }
        throw 'Unexpected gh fixture invocation'
    }
    $failed=$false
    try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Publish | Out-Null } catch { $failed=$_.Exception.Message -like 'PR creation failed*' }
    if (!$failed) { throw 'Publish interruption fixture did not stop.' }
    & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Publish -Resume | Out-Null
    & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Publish -Resume | Out-Null
    if ($global:firmPrCreates -ne 1 -or [int](& git -C $repo rev-list --count main..task/vs-001) -ne 1 -or @($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne 1) { throw 'Publish resume duplicated PR/commit/implementation.' }
    Remove-Item Function:\gh
    'PASS fixture: interrupted PR creation + repeated publish resume'
    foreach ($outcome in @('design_contract','infrastructure','implementation','unknown')) {
        $repo=Fixture ('legacy-'+$outcome); $root=Join-Path $fixtureRoot ('legacy-'+$outcome+'-wt')
        $global:firmMockMode='PARTIAL_PENDING'; $global:firmMockCalls=@()
        function global:firmRoleResultHook([string]$role) { if ($role -eq 'implementer') { throw 'fixture power loss' } }
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot | Out-Null } catch { if ($_.Exception.Message -ne 'fixture power loss') { throw } }
        Remove-Item Function:\firmRoleResultHook
        $wt=Join-Path $root 'VS-001'; $run=(Get-ChildItem (Join-Path $wt '.agent/runs/VS-001') -Directory)[0].FullName
        # Migrate the exact current VS-006 result bytes through a legacy saved schema.
        $legacyPath=Join-Path $PSScriptRoot 'fixtures/vs006-legacy-implementer.json'
        if ((Get-FileHash $legacyPath).Hash -cne '6D22167FCAE1388B3B3937667570AA9A2171F77A16F69CD57A2CEFFE95C94C6C') { throw 'VS-006 legacy fixture changed.' }
        Copy-Item -LiteralPath $legacyPath -Destination (Join-Path $run 'implementer.json')
        $schema=Get-Content (Join-Path $run 'implementer.schema.json') -Raw | ConvertFrom-Json
        $schema.properties.PSObject.Properties.Remove('blocker_kind'); $schema.required=@($schema.required | Where-Object { $_ -ne 'blocker_kind' })
        [IO.File]::WriteAllText((Join-Path $run 'implementer.schema.json'),($schema | ConvertTo-Json -Depth 12),[Text.UTF8Encoding]::new($false))
        $cp=Get-Content (Join-Path $run 'checkpoint.json') -Raw | ConvertFrom-Json
        $cp.evidence.'implementer.schema.json'=(Get-FileHash (Join-Path $run 'implementer.schema.json')).Hash
        [IO.File]::WriteAllText((Join-Path $run 'checkpoint.json'),($cp | ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
        [IO.File]::WriteAllText((Join-Path $run 'checkpoint.sha256'),(Get-FileHash (Join-Path $run 'checkpoint.json')).Hash)
        $sourceHash=(Get-FileHash (Join-Path $run 'implementer.json')).Hash
        $global:firmMockMode='LEGACY_'+$outcome
        for ($replay=0; $replay -lt 2; $replay++) {
            $failure=''
            try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume -PrepareLegacyResume | Out-Null } catch { $failure=$_.Exception.Message }
            if ($outcome -eq 'design_contract') { if ($failure) { throw $failure } }
            elseif ($failure -notlike ('*['+$outcome+']*')) { if (!$failure.Contains('['+$outcome+']')) { throw "Wrong route: $failure" } }
        }
        if (@($global:firmMockCalls | Where-Object { $_ -eq 'blocker-classifier' }).Count -ne 1) { throw 'Repeated resume reclassified legacy result.' }
        if (@($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne 1 -or (Get-FileHash (Join-Path $run 'implementer.json')).Hash -ne $sourceHash) { throw 'Legacy Implementer reran or changed.' }
        $closureCount=@($global:firmMockCalls | Where-Object { $_ -eq 'design-closure' }).Count
        if (($outcome -eq 'design_contract' -and $closureCount -ne 1) -or ($outcome -ne 'design_contract' -and $closureCount -ne 0)) { throw 'Classifier opened wrong design route.' }
        if ($outcome -eq 'design_contract') {
            $cp=Get-Content (Join-Path $run 'checkpoint.json') -Raw | ConvertFrom-Json
            if ($cp.next_phase -ne 'Implementer (design cycle 1, review cycle 0)') { throw "Wrong migration phase: $($cp.next_phase)" }
            & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume | Out-Null
            if (@($global:firmMockCalls | Where-Object { $_ -eq 'implementer' }).Count -ne 2 -or @($global:firmMockCalls | Where-Object { $_ -eq 'blocker-classifier' }).Count -ne 1) { throw 'Legacy migration failed to restart Implementer exactly once.' }
            if ((Get-Content (Join-Path $wt '.agent/tasks/VS-001.md') -Raw) -notmatch 'revision 2') { throw 'Legacy restart used stale contract.' }
            'PASS fixture: legacy design migration restarts Implementer with revised contract'
            $classifier=Join-Path $run 'legacy-implementer/blocker-classifier.json'
            [IO.File]::AppendAllText($classifier,' ')
            $failed=$false
            try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot $root -Godot firmMockGodot -Resume -PrepareLegacyResume | Out-Null } catch { $failed=$_.Exception.Message -like '*checkpoint evidence hash*' }
            if (!$failed) { throw 'Tampered classifier accepted.' }
            'PASS fixture: tampered classifier result stops before replay'
        }
        "PASS fixture: legacy $outcome + current VS-006 bytes + repeated resume + bounded routing"
    }
    $jsonFiles = @(Get-ChildItem -LiteralPath $fixtureRoot -Recurse -File | Where-Object { $_.Extension -in @('.json','.jsonl') })
    foreach ($file in $jsonFiles) {
        if ($file.FullName -like '*legacy-*implementer.events.jsonl' -or $file.FullName -like '*PARTIAL_READY*implementer.events.jsonl' -or $file.FullName -like '*partial-pending*implementer.events.jsonl') { continue }
        AssertMachineJson $file.FullName
    }
    foreach ($name in @('planner.schema.json','implementer.schema.json','reviewer.schema.json','invocation.json','tests.json','completion.json','stopped.json','planner.events.jsonl','implementer.events.jsonl','reviewer.events.jsonl')) {
        if ($jsonFiles.Name -notcontains $name) { throw "Missing JSON coverage: $name" }
    }
    "PASS fixture: $($jsonFiles.Count) generated artifacts audited: machine JSON/schema/events BOM-free and parseable; intentional raw truncations covered separately"
    "Fixture files retained for inspection: $fixtureRoot"
    & (Join-Path $PSScriptRoot 'role-artifacts-self-test.ps1')
    & (Join-Path $PSScriptRoot 'git-scope-self-test.ps1')
} finally {
    Remove-Item Function:\codex,Function:\firmMockGodot
    Remove-Variable firmMockMode,firmMockCalls -Scope Global
}
