param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputFile)) {
  throw "No existe el archivo de backup: $InputFile"
}

Write-Host "Restaurando backup PostgreSQL desde $InputFile ..."
Get-Content -Raw $InputFile | docker compose exec -T postgres psql -U tpv -d tpv
Write-Host "Restore completado."
