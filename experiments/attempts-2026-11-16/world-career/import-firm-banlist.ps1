param([string]$InputPath = "$PSScriptRoot/out/moj-firms-2026-09-21.xlsx")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $InputPath))
try {
  $reader = [IO.StreamReader]::new($archive.GetEntry('xl/sharedStrings.xml').Open())
  try { [xml]$strings = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $reader = [IO.StreamReader]::new($archive.GetEntry('xl/worksheets/sheet1.xml').Open())
  try { [xml]$sheet = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $texts = @($strings.sst.si | ForEach-Object { $_.InnerText })
  $names = @($sheet.worksheet.sheetData.row | Where-Object { [int]$_.r -ge 3 } | ForEach-Object {
    $_.c | Where-Object { $_.r -match '^B\d+$' -and $_.t -eq 's' } | ForEach-Object { $texts[[int]$_.v] }
  })
  if ($names.Count -ne 1715) { throw "Unexpected source rows: $($names.Count)" }
  $data = [ordered]@{
    source = 'https://www.moj.go.kr/bbs/moj/106/610543/artclView.do'
    download = 'https://www.moj.go.kr/bbs/moj/106/499681/download.do'
    asOf = '2026-09-21'; attribution = 'Ministry of Justice, Republic of Korea; KOGL Type 1'
    sourceSha256 = (Get-FileHash -LiteralPath $InputPath -Algorithm SHA256).Hash.ToLower()
    count = $names.Count; names = $names
  }
  $packPath = "$PSScriptRoot/packs/ko.json"
  $pack = Get-Content -LiteralPath $packPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $pack.firmRegistry = $data
  [IO.File]::WriteAllText($packPath, ($pack | ConvertTo-Json -Depth 20) + "`n", [Text.UTF8Encoding]::new($false))
  Write-Output "Imported $($names.Count) firm names (name column only)."
} finally { $archive.Dispose() }
