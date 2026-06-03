# Full monorepo verify — logs to scripts/verify-results.log
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$Log = Join-Path $PSScriptRoot "verify-results.log"
Set-Location $Root

function Run-Step($Name, $Args) {
    "`n========== $Name ==========" | Tee-Object -FilePath $Log -Append
    $start = Get-Date
    & corepack @Args 2>&1 | Tee-Object -FilePath $Log -Append
    $code = $LASTEXITCODE
    "EXIT_CODE=$code (elapsed $((Get-Date) - $start))" | Tee-Object -FilePath $Log -Append
    return $code
}

"" | Set-Content $Log
"Started $(Get-Date -Format o)" | Tee-Object -FilePath $Log -Append

$steps = @(
    @("core build", @("pnpm", "--filter", "@context-translate/core", "build")),
    @("core test", @("pnpm", "--filter", "@context-translate/core", "test")),
    @("api build", @("pnpm", "--filter", "@context-translate/api", "build")),
    @("extension build", @("pnpm", "--filter", "@context-translate/extension", "build")),
    @("desktop build (vite)", @("pnpm", "--filter", "@context-translate/desktop", "build"))
)

$failed = @()
foreach ($s in $steps) {
    $code = Run-Step $s[0] $s[1]
    if ($code -ne 0) { $failed += $s[0] }
}

"`n========== SUMMARY ==========" | Tee-Object -FilePath $Log -Append
if ($failed.Count -eq 0) {
    "ALL PASSED" | Tee-Object -FilePath $Log -Append
    exit 0
} else {
    "FAILED: $($failed -join ', ')" | Tee-Object -FilePath $Log -Append
    exit 1
}
