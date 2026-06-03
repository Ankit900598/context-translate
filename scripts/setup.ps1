# LOCAL ONLY — install, build, test. No git push, gh, deploy, or GCP billing.
# Uses `corepack pnpm` (works when `pnpm` is not on PATH / corepack enable EPERM)
# See LOCAL_ONLY.md
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$pnpm = "corepack"
$pnpmArgs = @("pnpm")

function Invoke-Pnpm {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & $pnpm @pnpmArgs @Args
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "==> Node: $(node -v)"
Write-Host "==> Using: corepack pnpm (no global pnpm install required)"

Write-Host "==> Installing dependencies..."
Invoke-Pnpm install

Write-Host "==> Building core package..."
Invoke-Pnpm --filter @context-translate/core build

Write-Host "==> Running core tests (tsx)..."
Invoke-Pnpm test

Write-Host "==> Building Chrome extension..."
Invoke-Pnpm --filter @context-translate/extension build

if (Get-Command rustc -ErrorAction SilentlyContinue) {
  Write-Host "==> Generating Tauri icons..."
  Push-Location apps/desktop
  if (-not (Test-Path src-tauri/icons/icon.png)) {
    Invoke-Pnpm tauri icon app-icon.svg 2>$null
  }
  Pop-Location
} else {
  Write-Host "WARN: Rust not installed — skip desktop. https://rustup.rs"
}

if (-not (Test-Path .git)) {
  git init
  Write-Host "==> Git repository initialized"
}

Write-Host ""
Write-Host "Done. Demo mode works with no API key or server."
Write-Host "  corepack pnpm dev:extension"
Write-Host "  corepack pnpm dev:desktop     # needs Rust"
Write-Host "  corepack pnpm dev:api         # optional Pro/hosted only"
