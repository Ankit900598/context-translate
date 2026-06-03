# LOCAL ONLY — prove runnable locally. No push, deploy, or paid services. See LOCAL_ONLY.md
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "==> verify: corepack pnpm install"
corepack pnpm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> verify: core build"
corepack pnpm run build:core
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> verify: core test"
corepack pnpm test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> verify: extension build"
corepack pnpm run build:extension
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "All checks passed."
