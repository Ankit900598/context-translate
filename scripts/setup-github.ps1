# One-shot: init git, commit, create public GitHub repo, push.
# Run from repo root: powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/setup-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== Context Translate: GitHub setup ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git is not installed or not on PATH."
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "GitHub CLI (gh) is not installed. Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Install gh: https://cli.github.com/"
    Write-Host "2. gh auth login"
    Write-Host "3. In this folder, after git init + commit:"
    Write-Host "   gh repo create context-translate --public --source=. --remote=origin --push"
    Write-Host "   (or context-translate-app if the name is taken)"
    exit 1
}

$gitInit = $false
if (-not (Test-Path .git)) {
    git init
    $gitInit = $true
    Write-Host "Initialized new git repository." -ForegroundColor Green
} else {
    Write-Host "Git repository already exists." -ForegroundColor Green
}

$gitignorePath = Join-Path (Get-Location) ".gitignore"
$gi = if (Test-Path $gitignorePath) { Get-Content $gitignorePath -Raw } else { "" }
if ($gi -notmatch '(?m)^\.env\s*$' -and $gi -notmatch '(?m)^\.env/') {
    if ($gi -and -not $gi.EndsWith("`n")) { Add-Content $gitignorePath "" }
    Add-Content $gitignorePath ".env"
    Write-Host "Added .env to .gitignore." -ForegroundColor Green
} else {
    Write-Host ".env already listed in .gitignore." -ForegroundColor Green
}

git add -A
Write-Host ""
git status

$porcelain = git status --porcelain
if ($porcelain) {
    git commit -m "Context Translate: Chrome v1 local-first demo extension"
    $hash = git rev-parse --short HEAD
    Write-Host "Committed: $hash" -ForegroundColor Green
} else {
    Write-Host "Nothing to commit (working tree clean)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== gh auth status ===" -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

$names = @("context-translate", "context-translate-app")
$created = $false
foreach ($name in $names) {
    Write-Host ""
    Write-Host "Trying: gh repo create $name --public --source=. --remote=origin --push" -ForegroundColor Cyan
    gh repo create $name --public --source=. --remote=origin --push 2>&1
    if ($LASTEXITCODE -eq 0) {
        $created = $true
        $url = "https://github.com/$(gh api user -q .login)/$name"
        Write-Host ""
        Write-Host "Repository URL: $url" -ForegroundColor Green
        break
    }
}

if (-not $created) {
    Write-Error "Could not create repo with context-translate or context-translate-app. Pick another name or create the repo on github.com manually."
}

Write-Host ""
git remote -v
