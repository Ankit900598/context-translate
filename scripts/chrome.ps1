# Build Context Translate Chrome extension, open extensions + local test page
param(
    [switch]$SkipTestPage
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root "apps\extension\.output\chrome-mv3"
$TestPage = Join-Path $Root "apps\extension\test-page.html"

function Get-ChromeExe {
    $candidates = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        ${env:ProgramFiles(x86)} + "\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($path in $candidates) {
        if ($path -and (Test-Path $path)) { return $path }
    }
    return $null
}

function Open-InChrome([string]$Url) {
    $chrome = Get-ChromeExe
    if ($chrome) {
        Start-Process -FilePath $chrome -ArgumentList $Url
    } else {
        Write-Host "Chrome not found in default paths; opening with default browser." -ForegroundColor Yellow
        Start-Process $Url
    }
}

Set-Location $Root

Write-Host ""
Write-Host "==> Building Chrome extension..." -ForegroundColor Cyan
corepack pnpm --filter @context-translate/extension build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

if (-not (Test-Path $OutDir)) {
    Write-Host "Expected output missing: $OutDir" -ForegroundColor Red
    exit 1
}

$resolved = (Resolve-Path $OutDir).Path

Write-Host ""
Write-Host "BUILD OK" -ForegroundColor Green
Write-Host ""
Write-Host "Load this folder in Chrome (Load unpacked):" -ForegroundColor Yellow
Write-Host "  $resolved" -ForegroundColor White
Write-Host ""
Write-Host "Steps:" -ForegroundColor Cyan
Write-Host "  1. chrome://extensions  (opening now)"
Write-Host "  2. Developer mode ON"
Write-Host "  3. Load unpacked -> paste path above"
Write-Host "  4. Test page opens next (or any website)"
Write-Host "  5. Select text -> right-click -> Translate selection"
Write-Host ""

Set-Clipboard -Value $resolved
Write-Host "Extension path copied to clipboard." -ForegroundColor Green
Write-Host ""

Open-InChrome "chrome://extensions"

if (-not $SkipTestPage) {
    if (-not (Test-Path $TestPage)) {
        Write-Host "Test page missing: $TestPage" -ForegroundColor Yellow
    } else {
        Start-Sleep -Milliseconds 900
        $testUri = (Resolve-Path $TestPage).Path
        $testUri = "file:///" + ($testUri -replace "\\", "/")
        Write-Host "Opening local test page:" -ForegroundColor Cyan
        Write-Host "  $testUri" -ForegroundColor White
        Write-Host ""
        Write-Host "If Translate is missing on this page, enable" -ForegroundColor Yellow
        Write-Host "  Allow access to file URLs" -ForegroundColor Yellow
        Write-Host "  on the extension Details card, then reload the tab." -ForegroundColor Yellow
        Write-Host ""
        Open-InChrome $testUri
    }
}
