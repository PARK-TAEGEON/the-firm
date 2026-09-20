# Legacy results remain immutable. Classification is a separate read-only role.
function LegacyClassificationPath([string]$RoleDirectory, [string]$Role) {
    return Join-Path $RoleDirectory ('legacy-'+$Role+'/blocker-classifier.json')
}
function CachedLegacyRoute($Result, [string]$RoleDirectory, [string]$Role) {
    $path=LegacyClassificationPath $RoleDirectory $Role
    $key=$path.Substring($phaseRoot.Length+1).Replace('\','/') -replace '\.json$',''
    if ($key -notin $script:resumeSafe) { return 'classification' }
    $binding=ReadResumeJson (Join-Path (Split-Path $path -Parent) 'binding.json')
    if ($binding.source_sha256 -cne (ResumeHash (Join-Path $RoleDirectory ($Role+'.json')))) { throw 'BLOCKED: legacy classification source changed.' }
    $classified=ReadRoleResult $path ($path -replace '\.json$','.schema.json') 'blocker-classifier' @('design_contract','infrastructure','implementation','unknown')
    if ($classified.verdict -ceq 'design_contract') { return 'design_closure' }
    return $classified.verdict
}
function EnsureLegacyClassification($Result, [string]$Role) {
    if ($Result.verdict -cne 'BLOCKED' -or $Result.PSObject.Properties['blocker_kind']) { return }
    $roleDirectory=$run
    if ((CachedLegacyRoute $Result $roleDirectory $Role) -ne 'classification') { return }
    # Saved-schema validation is mandatory, including for callers outside Agent.
    $verdicts=if ($Role -eq 'reviewer') { @('PASS','FIX REQUIRED','BLOCKED') } else { @('READY','BLOCKED') }
    $null=ReadRoleResult (Join-Path $run ($Role+'.json')) (Join-Path $run ($Role+'.schema.json')) $Role $verdicts
    $classifierDirectory=Split-Path (LegacyClassificationPath $run $Role) -Parent
    $null=New-Item -ItemType Directory -Path $classifierDirectory -Force
    $bindingPath=Join-Path $classifierDirectory 'binding.json'
    if (!(Test-Path -LiteralPath $bindingPath)) {
        $documents=@()
        foreach ($file in @(Get-ChildItem -LiteralPath $wt -Filter 'DEC-*.md' -File | Sort-Object Name)) {
            $header=(Get-Content -LiteralPath $file.FullName -Encoding UTF8 | Select-Object -First 60) -join "`n"
            if ($header -match '(?im)^(Status|\uC0C1\uD0DC):\s*\*{0,2}Accepted\b') { $documents+=@{path=$file.Name;sha256=(ResumeHash $file.FullName);header=$header} }
        }
        $contract=Join-Path $roleDirectory 'contract.md'
        if (!(Test-Path -LiteralPath $contract)) { $contract=Join-Path $wt ('.agent/tasks/'+$id+'.md') }
        SaveJson @{source_sha256=(ResumeHash (Join-Path $roleDirectory ($Role+'.json')));source_schema_sha256=(ResumeHash (Join-Path $roleDirectory ($Role+'.schema.json')));
            source=(ReadResumeJson (Join-Path $roleDirectory ($Role+'.json')));contract=$(if (Test-Path $contract) { [IO.File]::ReadAllText($contract,[Text.Encoding]::UTF8) } else { '' });
            contract_sha256=$(if (Test-Path $contract) { ResumeHash $contract } else { '' });accepted_headers=$documents;
            metadata=@{vs=$id;branch=$Branch;base=$base;role=$Role;run=$roleDirectory;invocation=(ReadResumeJson (Join-Path $phaseRoot 'invocation.json'))}} $bindingPath
    }
    $savedRun=$run
    try {
        $run=$classifierDirectory
        $classification=Agent 'blocker-classifier' 'read-only' @('design_contract','infrastructure','implementation','unknown') (Get-Content -LiteralPath $bindingPath -Raw -Encoding UTF8)
        MarkSafe (ResumeKey 'blocker-classifier')
    } finally { $run=$savedRun }
}
function RoleBlockerRoute($Result, [string]$RoleDirectory, [string]$Role) {
    if ($Result.verdict -cne 'BLOCKED') { return 'none' }
    if (!$Result.PSObject.Properties['blocker_kind']) { return CachedLegacyRoute $Result $RoleDirectory $Role }
    return ImplementationBlockerRoute $Result
}
