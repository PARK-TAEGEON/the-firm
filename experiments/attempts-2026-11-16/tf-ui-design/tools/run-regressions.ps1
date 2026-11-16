param([switch]$RequiredOnly)
$ErrorActionPreference = 'Continue'
$taskRoot = Split-Path (Split-Path (Split-Path (Split-Path $PSScriptRoot)))
$taskOut = Join-Path (Split-Path $PSScriptRoot) 'evidence/post-tests'
New-Item -ItemType Directory -Force $taskOut | Out-Null
$env:NODE_PATH = 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
Set-Location (Join-Path $taskRoot 'courtroom-prototype')
$taskRuns = @()
foreach ($taskCheck in @(@{name='core';command='npm test';exe='npm.cmd';args=@('test')},@{name='plan-demo';command='node --test tests/demo.test.js tests/plan-demo.test.js tests/plan-demo-ui.test.js';exe='node';args=@('--test','tests/demo.test.js','tests/plan-demo.test.js','tests/plan-demo-ui.test.js')},@{name='browser';command='npm run test:browser';exe='npm.cmd';args=@('run','test:browser')},@{name='trial';command='npm run test:trial';exe='npm.cmd';args=@('run','test:trial')},@{name='budget';command='npm run test:budget';exe='npm.cmd';args=@('run','test:budget')})) {
 if ($RequiredOnly -and $taskCheck.name -notin @('core','plan-demo')) { continue }
 $taskStarted = (Get-Date).ToString('o')
 $taskExe=$taskCheck.exe
 $taskArgs=$taskCheck.args
 & $taskExe @taskArgs *> (Join-Path $taskOut ($taskCheck.name+'.log'))
 $taskExit=$LASTEXITCODE
 $taskRuns += @{name=$taskCheck.name;command=$taskCheck.command;exitCode=$taskExit;started=$taskStarted;finished=(Get-Date).ToString('o');log=$taskCheck.name+'.log'}
 Write-Output ($taskCheck.name+': exit '+$taskExit)
}
$taskRunFile = if ($RequiredOnly) { 'required-rerun.json' } else { 'runs.json' }
$taskRuns | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 (Join-Path $taskOut $taskRunFile)
