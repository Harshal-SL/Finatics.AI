# Test Goal Analyzer Endpoint Script
# Tests the /api/goals endpoint with sample data

Write-Host "Starting Goal Analyzer Test..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the test directory
Set-Location -Path "e:\Code\Finatics.AI\BackEnd\test"

# Run the test script
node test_goal_analyzer.js

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Completed!" -ForegroundColor Green
