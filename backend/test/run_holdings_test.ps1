# Test Holdings API
# Run this script to test the holdings endpoint

Write-Host "Testing Holdings API..." -ForegroundColor Cyan
Write-Host "User ID: 6b867f4e-6461-416e-8f6c-13ae8e177070" -ForegroundColor Yellow
Write-Host "Account Number: 5893143322" -ForegroundColor Yellow
Write-Host ""

node test/test_holdings.js
