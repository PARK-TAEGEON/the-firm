# Shared by every role and nested design/review cycle. Raw streams are never rewritten.
function ReadRoleResult([string]$Path, [string]$SchemaPath, [string]$Role, [string[]]$Verdicts) {
    try {
        $result=ReadResumeJson $Path
        $schema=ReadResumeJson $SchemaPath
        if (!$result -or $result -is [array] -or !$result.PSObject.Properties['verdict']) { throw 'expected object' }
        foreach ($name in $schema.required) { if (!$result.PSObject.Properties[$name]) { throw "missing $name" } }
        foreach ($p in $result.PSObject.Properties) {
            $rule=$schema.properties.PSObject.Properties[$p.Name]
            if (!$rule) { throw "unexpected $($p.Name)" }
            $v=$p.Value; $r=$rule.Value
            if ($r.type -eq 'string' -and $v -isnot [string]) { throw "string required: $($p.Name)" }
            if ($r.type -eq 'array') {
                if ($v -isnot [array]) { throw "array required: $($p.Name)" }
                foreach ($item in $v) { if ($item -isnot [string]) { throw 'string array required' } }
            }
            if ($r.PSObject.Properties['enum'] -and $v -cnotin $r.enum) { throw "enum: $($p.Name)" }
        }
        if ($result.verdict -cnotin $Verdicts -or [string]::IsNullOrWhiteSpace($result.reason)) { throw 'invalid verdict/reason' }
        if ($result.PSObject.Properties['blocker_kind'] -and ($result.blocker_kind -cnotin @('none','design_closure','other') -or ($result.verdict -eq 'READY' -and $result.blocker_kind -cne 'none'))) { throw 'invalid blocker_kind' }
        return $result
    } catch { throw "INFRASTRUCTURE: $Role authoritative result missing/invalid: $($_.Exception.Message)" }
}
function ReadRoleEvents([string]$Path) {
    $valid=@(); $bad=@(); $partial=$false
    if (Test-Path -LiteralPath $Path) {
        $lines=[IO.File]::ReadAllLines($Path, [Text.Encoding]::UTF8)
        $last=-1
        for ($i=0; $i -lt $lines.Length; $i++) { if ($lines[$i].Trim()) { $last=$i } }
        for ($i=0; $i -le $last; $i++) {
            if (!$lines[$i].Trim()) { continue }
            try { $event=ConvertFrom-Json -InputObject $lines[$i] -ErrorAction Stop; $valid+=,$event }
            catch {
                $final=$i -eq $last
                $partial=$partial -or $final
                $bad+=@{line=($i+1);final=$final;raw=$lines[$i];error=$_.Exception.Message}
            }
        }
    }
    return @{events=$valid;event_stream_partial=$partial;event_stream_corrupt=(@($bad | Where-Object { !$_.final }).Count -gt 0);quarantine=$bad}
}
function SaveRoleDiagnostics([string]$Directory, [string]$Role, $Stream, $Code, [bool]$ValidResult) {
    SaveJson @{event_stream_partial=$Stream.event_stream_partial;event_stream_corrupt=$Stream.event_stream_corrupt;
        valid_event_count=$Stream.events.Count;invalid_line_count=$Stream.quarantine.Count;authoritative_result_valid=$ValidResult;process_exit=$Code;
        raw_event_sha256=$(if (Test-Path (Join-Path $Directory ($Role+'.events.jsonl'))) { ResumeHash (Join-Path $Directory ($Role+'.events.jsonl')) } else { $null })} (Join-Path $Directory ($Role+'.diagnostics.json'))
    if ($Stream.quarantine.Count) { SaveJson @{lines=$Stream.quarantine} (Join-Path $Directory ($Role+'.events.quarantine.json')) }
}
# Recover only result bytes and schema bound to a fully validated checkpoint.
# The preceding worktree hashes must still match; uncheckpointed code edits fail closed.
function RecoverRoleArtifacts($Checkpoint) {
    foreach ($p in $Checkpoint.evidence.PSObject.Properties) {
        if ($p.Name -notmatch '(^|/)(planner|implementer|reviewer|design-closure)\.schema\.json$') { continue }
        if ($p.Name -match '(^|/)resumed-') { continue }
        $role=$Matches[2]; $relative=$p.Name -replace '\.schema\.json$','.json'
        $key=$relative -replace '\.json$',''
        if ($key -in $script:resumeSafe) { continue }
        $path=Join-Path $phaseRoot $relative
        if (!(Test-Path -LiteralPath $path)) { continue }
        $verdicts=if ($role -eq 'reviewer') { @('PASS','FIX REQUIRED','BLOCKED') } else { @('READY','BLOCKED') }
        # No retrospective inference of legacy blocker_kind; a legacy BLOCKED stays BLOCKED.
        $result=ReadRoleResult $path (Join-Path $phaseRoot $p.Name) $role $verdicts
        $stream=ReadRoleEvents ($path -replace '\.json$','.events.jsonl')
        if (!$InspectResume) { SaveRoleDiagnostics (Split-Path $path -Parent) $role $stream $null $true }
        if ($role -eq 'design-closure') {
            $closurePath=Join-Path (Split-Path $path -Parent) 'closure-result.json'
            if (!(Test-Path $closurePath) -and !$InspectResume) {
                # Checkpoint state equality proves this unsealed role changed no bytes.
                $null=Invoke-FirmGit @('diff','--check') $wt
                SaveJson @{verdict=$result.verdict;reason=$result.reason;changed_files=@();validation='unchanged checkpoint state; git diff --check PASS'} $closurePath
            }
        }
        $script:resumeSafe=@($script:resumeSafe+$key | Sort-Object -Unique)
    }
    if (!$InspectResume) { SaveCheckpoint }
}
