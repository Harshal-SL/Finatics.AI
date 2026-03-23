# PowerShell script to run thorough loan metrics cross-check

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "Thorough Loan Metrics Cross-Check" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

$envPath = "e:\Code\Finatics.AI\BackEnd\.env"
if (Test-Path $envPath) {
    Write-Host "OK .env file found" -ForegroundColor Green
} else {
    Write-Host "ERROR .env file NOT found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running thorough cross-check..." -ForegroundColor Yellow
Write-Host ""

Set-Location "e:\Code\Finatics.AI\BackEnd"

# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

node test/thorough_loan_check.js

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "Cross-check complete" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
