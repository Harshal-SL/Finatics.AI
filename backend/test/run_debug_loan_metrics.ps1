# PowerShell script to debug loan metrics calculation

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Loan Metrics Debug Test" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

$envPath = "e:\Code\Finatics.AI\BackEnd\.env"
if (Test-Path $envPath) {
    Write-Host "OK .env file found" -ForegroundColor Green
} else {
    Write-Host "ERROR .env file NOT found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running debug script..." -ForegroundColor Yellow
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

node test/debug_loan_metrics.js

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Debug complete" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
