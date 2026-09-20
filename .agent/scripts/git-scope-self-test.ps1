[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$tokens=$null; $parseErrors=$null
$ast=[Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'start-vs.ps1'),[ref]$tokens,[ref]$parseErrors)
if ($parseErrors.Count) { throw ($parseErrors -join '; ') }
foreach ($name in @('Invoke-FirmGitResult','Invoke-FirmGit','Test-FirmAncestor')) {
    $fn=$ast.Find({param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name},$true)
    Invoke-Expression $fn.Extent.Text
}
# Exercise the actual final scope guard, rather than a copy of its behavior.
$guard=$ast.Find({param($node) $node -is [Management.Automation.Language.ForEachStatementAst] -and $node.Extent.Text -like '*FIX REQUIRED: out-of-scope change:*'},$true).Extent.Text
$repo=Join-Path ([IO.Path]::GetTempPath()) ('firm-git-scope-'+[guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory -Path $repo
$Repository=$repo
$null=Invoke-FirmGit @('init','-q') $repo
[IO.File]::WriteAllText((Join-Path $repo 'allowed.txt'),"base`n",[Text.UTF8Encoding]::new($false))
$null=Invoke-FirmGit @('-c','core.autocrlf=false','add','allowed.txt') $repo
$null=Invoke-FirmGit @('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-q','-m','fixture') $repo
$allowed=@('allowed.txt')
$changed=@(Invoke-FirmGit @('diff','--name-only','HEAD') $repo)
Invoke-Expression $guard
if ($changed.Count) { throw 'Clean scope returned data' }
'PASS: clean scope'
[IO.File]::WriteAllText((Join-Path $repo 'allowed.txt'),"changed`n",[Text.UTF8Encoding]::new($false))
$argsList=@('-c','core.autocrlf=true','-c','core.safecrlf=warn','diff','--name-only','HEAD')
$result=Invoke-FirmGitResult $argsList $repo
if ($result.ExitCode -ne 0 -or $result.Stderr -notmatch 'LF will be replaced by CRLF') { throw "Fixture did not emit actual CRLF warning: $($result.Stderr)" }
$changed=@(Invoke-FirmGit $argsList $repo)
if ($changed.Count -ne 1 -or $changed[0] -cne 'allowed.txt') { throw 'Warning contaminated stdout or diagnostics lost' }
Invoke-Expression $guard
'PASS: real CRLF stderr warning retained separately; allowed scope passes'
[IO.File]::WriteAllText((Join-Path $repo 'forbidden.txt'),"outside`n")
$changed=@(Invoke-FirmGit $argsList $repo)+@(Invoke-FirmGit @('ls-files','--others','--exclude-standard') $repo)
$blocked=$false
try { Invoke-Expression $guard } catch { $blocked=$_.Exception.Message -ceq 'FIX REQUIRED: out-of-scope change: forbidden.txt' }
if (!$blocked) { throw 'Real out-of-scope file not rejected' }
'PASS: genuine out-of-scope path rejected despite warning noise'
$blocked=$false
try { Invoke-FirmGit @('diff','--name-only','missing-firm-ref') $repo | Out-Null } catch { $blocked=$_.Exception.Message -match 'failed \(exit [1-9][0-9]*\).*' -and $_.Exception.Message -match 'missing-firm-ref' }
if (!$blocked) { throw 'Nonzero Git failure was hidden' }
'PASS: genuine Git failure retains exit code and diagnostics'
if (!(Test-FirmAncestor HEAD HEAD $repo)) { throw 'Ancestor result broken' }
$blocked=$false
try { Test-FirmAncestor missing-firm-ref HEAD $repo | Out-Null } catch { $blocked=$_.Exception.Message -like 'BLOCKED: git merge-base*exit*' }
if (!$blocked) { throw 'Ancestor Git failure hidden' }
'PASS: ancestor success and genuine failure preserved'
'SUMMARY: 5 test groups, 0 failures'
"Fixture retained: $repo"
