[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Worktree,
    [Parameter(Mandatory=$true)][ValidateRange(1,999)][int]$VS,
    [Parameter(Mandatory=$true)][string]$RunDirectory,
    [string]$Godot = 'godot'
)
$ErrorActionPreference = 'Stop'
$project = Join-Path $Worktree 'litigation-skeleton'
$null = Get-Command $Godot -ErrorAction Stop
$suites = @(@{Name='legacy'; Script='tests/run_regressions.gd'; Log='test-results.log'})
for ($n=1; $n -le $VS; $n++) {
    $script = if ($n -eq 1) { 'vertical_slice/tests/run_slice_regressions.gd' } else { 'vertical_slice/tests/run_vs{0:000}_regressions.gd' -f $n }
    $log = if ($n -eq 1) { 'vertical_slice/test-results.log' } else { 'vertical_slice/vs{0:000}-test-results.log' -f $n }
    $suites += @{Name=('VS-{0:000}' -f $n); Script=$script; Log=$log}
}
foreach ($suite in $suites) {
    if (!(Test-Path -LiteralPath (Join-Path $project $suite.Script))) { throw "Missing required suite: $($suite.Script)" }
}
$suites += @{Name='smoke'; Script=$null; Log=$null}
$results = @()
Push-Location $project
try {
    foreach ($suite in $suites) {
        $arguments = @('--headless','--path','.')
        if ($suite.Script) { $arguments += @('--log-file',('./'+$suite.Log),'--script',('res://'+$suite.Script)) }
        else { $arguments += @('--quit-after','2') }
        try {
            $ErrorActionPreference = 'Continue'
            $output = @(& $Godot @arguments 2>&1 | ForEach-Object { "$_" })
            $code = $LASTEXITCODE
        } finally { $ErrorActionPreference = 'Stop' }
        $output | Set-Content -LiteralPath (Join-Path $RunDirectory ($suite.Name+'.log')) -Encoding UTF8
        $summary = [regex]::Match(($output -join "`n"),'SUMMARY (\d+) checks, (\d+) failures')
        $passed = ($code -eq 0) -and !(($output -join "`n") -match 'SCRIPT ERROR|Parse Error|ERROR:')
        if ($suite.Script) { $passed = $passed -and $summary.Success -and ([int]$summary.Groups[1].Value -gt 0) -and ([int]$summary.Groups[2].Value -eq 0) }
        $results += [pscustomobject]@{suite=$suite.Name; arguments=$arguments; exit_code=$code; summary=$summary.Value; passed=$passed}
    }
} finally { Pop-Location }
$results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $RunDirectory 'tests.json') -Encoding UTF8
if (@($results | Where-Object { !$_.passed }).Count) { throw 'Required regression/smoke failed. See tests.json.' }
