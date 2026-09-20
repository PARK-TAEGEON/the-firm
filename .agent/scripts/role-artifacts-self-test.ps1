# Focused parser/result fixtures; intentionally damaged streams remain outside the
# main suite's BOM-free/parseable generated-artifact audit.
$artifactRoot=Join-Path ([IO.Path]::GetTempPath()) ('firm-role-artifacts-'+[guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory -Path $artifactRoot
. (Join-Path $PSScriptRoot 'resume-vs.ps1')
. (Join-Path $PSScriptRoot 'role-artifacts.ps1')
function SaveJson($Value, [string]$Path) { [IO.File]::WriteAllText($Path,($Value | ConvertTo-Json -Depth 12),[Text.UTF8Encoding]::new($false)) }
$schema=@{type='object';additionalProperties=$false;required=@('verdict','reason','contract_markdown','allowed_files','blocker_kind');properties=@{
    verdict=@{type='string';enum=@('READY','BLOCKED')};reason=@{type='string'};contract_markdown=@{type='string'};
    allowed_files=@{type='array';items=@{type='string'}};blocker_kind=@{type='string';enum=@('none','design_closure','other')}}}
SaveJson $schema (Join-Path $artifactRoot 'implementer.schema.json')
$result=@{verdict='READY';reason='fixture';contract_markdown='';allowed_files=@();blocker_kind='none'}
# BOM input is accepted; the original bytes remain untouched.
[IO.File]::WriteAllText((Join-Path $artifactRoot 'implementer.json'),($result | ConvertTo-Json),[Text.UTF8Encoding]::new($true))
foreach ($case in @('TRUNCATED','MISSING','COMPLETE','MIDDLE')) {
    $raw=switch ($case) {
        'COMPLETE' { "{`"type`":`"item.completed`"}`n{`"ok`":true}" }
        'MIDDLE' { "{`"ok`":true}`n{broken`n{`"ok`":true}" }
        default { "{`"ok`":true}`n{`"type`":`"item.completed`",`"text`":`"unterminated" }
    }
    $eventPath=Join-Path $artifactRoot ($case+'.events.jsonl')
    [IO.File]::WriteAllText($eventPath,$raw,[Text.UTF8Encoding]::new($false))
    $hash=ResumeHash $eventPath; $stream=ReadRoleEvents $eventPath
    if ($stream.event_stream_partial -ne ($case -in @('TRUNCATED','MISSING')) -or $stream.event_stream_corrupt -ne ($case -eq 'MIDDLE')) { throw "Stream classification: $case" }
    if ($stream.events.Count -ne $(if ($case -in @('COMPLETE','MIDDLE')) {2} else {1})) { throw "Valid event count: $case" }
    $path=Join-Path $artifactRoot $(if ($case -eq 'MISSING') {'absent.json'} else {'implementer.json'})
    $failed=$false
    try { $null=ReadRoleResult $path (Join-Path $artifactRoot 'implementer.schema.json') 'implementer' @('READY','BLOCKED') }
    catch { $failed=$_.Exception.Message -like 'INFRASTRUCTURE:*' }
    if ($failed -ne ($case -eq 'MISSING')) { throw "Authority: $case" }
    SaveRoleDiagnostics $artifactRoot $case $stream 1 (!$failed)
    if ((ResumeHash $eventPath) -cne $hash) { throw 'Raw event stream rewritten' }
    "PASS fixture: authoritative result/event stream $case"
}
foreach ($case in @('ENUM','TYPE','REQUIRED','EXTRA','BLOCKER')) {
    $bad=$result.Clone()
    switch ($case) {
        'ENUM' { $bad.verdict='PASS' }
        'TYPE' { $bad.allowed_files='wrong' }
        'REQUIRED' { $bad.Remove('reason') }
        'EXTRA' { $bad.extra=$true }
        'BLOCKER' { $bad.blocker_kind='design_closure' }
    }
    SaveJson $bad (Join-Path $artifactRoot 'invalid.json')
    $failed=$false
    try { $null=ReadRoleResult (Join-Path $artifactRoot 'invalid.json') (Join-Path $artifactRoot 'implementer.schema.json') 'implementer' @('READY','BLOCKED') } catch { $failed=$true }
    if (!$failed) { throw "Invalid role result accepted: $case" }
    "PASS fixture: role schema rejects $case"
}
"Role artifact fixtures retained: $artifactRoot"
