# Offline orchestration checks: real local Git worktrees, fake Codex/Godot.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('firm-orchestrator-test-'+[guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $fixtureRoot
$scriptPath = Join-Path $PSScriptRoot 'start-vs.ps1'
$global:firmMockMode = 'PASS'
$global:firmMockCalls = @()
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
        $at=$a[[array]::IndexOf($a,'--cd')+1]
        $role=[IO.Path]::GetFileNameWithoutExtension($resultPath)
        $global:firmMockCalls += $role
        $result=@{verdict='READY';reason='fixture';contract_markdown='';allowed_files=@()}
        if ($inputText -match 'Do not inspect or modify') { $result.reason='CODEX_ORCHESTRATOR_SMOKE_OK' }
        elseif ($role -eq 'planner') {
            $result.contract_markdown='# VS-001 fixture contract READY'
            $result.allowed_files=@('litigation-skeleton/REVIEW_PACKET.md')
            if ($global:firmMockMode -eq 'PLANNER_BLOCKED') { $result.verdict='BLOCKED' }
        } elseif ($role -eq 'implementer') {
            'Fixture implementation packet' | Set-Content (Join-Path $at 'litigation-skeleton/REVIEW_PACKET.md')
            if ($global:firmMockMode -eq 'SCOPE_FAIL') { 'unauthorized' | Set-Content (Join-Path $at 'forbidden.txt') }
            if ($global:firmMockMode -eq 'IMPLEMENTER_BLOCKED') { $result.verdict='BLOCKED' }
        } else {
            $result.verdict=if ($global:firmMockMode -eq 'FIX REQUIRED') { 'FIX REQUIRED' } elseif ($global:firmMockMode -eq 'REVIEWER_BLOCKED') { 'BLOCKED' } else { 'PASS' }
        }
        $result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $resultPath -Encoding UTF8
        '{"fixture":true}'
        $global:LASTEXITCODE=0
    }
}
function Fixture([string]$Name) {
    $source=Join-Path $fixtureRoot ($Name+'-source')
    $repo=Join-Path $fixtureRoot ($Name+'-repo')
    $null=New-Item -ItemType Directory -Path (Join-Path $source 'litigation-skeleton/tests'),(Join-Path $source 'litigation-skeleton/vertical_slice/tests') -Force
    'fixture' | Set-Content (Join-Path $source 'litigation-skeleton/tests/run_regressions.gd')
    'fixture' | Set-Content (Join-Path $source 'litigation-skeleton/vertical_slice/tests/run_slice_regressions.gd')
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
    foreach ($mode in @('PASS','PLANNER_BLOCKED','IMPLEMENTER_BLOCKED','TEST_FAIL','FIX REQUIRED','REVIEWER_BLOCKED','SCOPE_FAIL')) {
        $repo=Fixture ($mode -replace ' ','-')
        $global:firmMockMode=$mode
        $global:firmMockCalls=@()
        $failed=$false
        try { & $scriptPath -VS 001 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot $mode) -Godot firmMockGodot | Out-Null } catch { $failed=$true; if ($mode -eq 'PASS') { Write-Host $_.Exception.Message } }
        if ($mode -eq 'PASS' -and $failed) { throw 'PASS fixture unexpectedly failed.' }
        if ($mode -ne 'PASS' -and !$failed) { throw "$mode did not stop." }
        $count=[int](& git -C $repo rev-list --count main..task/vs-001)
        if ($count -ne $(if ($mode -eq 'PASS') {1} else {0})) { throw "$mode violated commit gate." }
        if ($mode -in @('PLANNER_BLOCKED','IMPLEMENTER_BLOCKED','TEST_FAIL','SCOPE_FAIL') -and $global:firmMockCalls -contains 'reviewer') { throw "$mode advanced to Reviewer." }
        if ($mode -eq 'PLANNER_BLOCKED' -and $global:firmMockCalls -contains 'implementer') { throw 'BLOCKED advanced to Implementer.' }
        "PASS fixture: $mode"
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
                if ($_.Exception.Message -notmatch 'BLOCKED: fixture') { throw }
            }
            if ($global:firmMockCalls -notcontains 'planner' -or $global:firmMockCalls -contains 'implementer') { throw 'Automatic normal-mode gate failed.' }
            'PASS fixture: persisted archive + automatic predecessor + normal gate'
        }
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
    try { & $scriptPath -VS 002 -Repository $repo -WorktreeRoot (Join-Path $fixtureRoot 'historical-next') -Godot firmMockGodot | Out-Null } catch { if ($_.Exception.Message -notmatch 'BLOCKED: fixture') { throw } }
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
    "Fixture files retained for inspection: $fixtureRoot"
} finally {
    Remove-Item Function:\codex,Function:\firmMockGodot
    Remove-Variable firmMockMode,firmMockCalls -Scope Global
}
