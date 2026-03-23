# PowerShell script to test dashboard endpoint
# This script starts the backend server and tests the dashboard endpoint

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Dashboard Endpoint Test Setup" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = "e:\Code\Finatics.AI\BackEnd\.env"
if (Test-Path $envPath) {
    Write-Host "OK .env file found" -ForegroundColor Green
} else {
    Write-Host "ERROR .env file NOT found - Please create it from .env.example" -ForegroundColor Red
    Write-Host "  Copy .env.example to .env and fill in your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Please wait 3 seconds for server to start..." -ForegroundColor Gray
Write-Host ""

# Start the backend server in the background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "e:\Code\Finatics.AI\BackEnd"
    node server.js
}

# Wait for server to start
Start-Sleep -Seconds 3

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Running Dashboard Test" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Run the test
Set-Location "e:\Code\Finatics.AI\BackEnd"
node test/test_dashboard_for_user.js

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Cleaning up..." -ForegroundColor Yellow

# Stop the server
Stop-Job -Job $serverJob
Remove-Job -Job $serverJob

Write-Host "OK Test complete" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
