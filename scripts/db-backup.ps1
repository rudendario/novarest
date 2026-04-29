param(
  [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputFile)) {
  $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $OutputFile = "backups/tpv_$timestamp.sql"
}

$outputDir = Split-Path -Parent $OutputFile
if (-not [string]::IsNullOrWhiteSpace($outputDir) -and -not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "Creando backup PostgreSQL en $OutputFile ..."
docker compose exec -T postgres pg_dump -U tpv -d tpv --no-owner --no-privileges > $OutputFile
Write-Host "Backup completado: $OutputFile"
