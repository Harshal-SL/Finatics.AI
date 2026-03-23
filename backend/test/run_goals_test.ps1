# Goals API Test Commands
# Quick reference for testing the Goals API endpoints

$BASE_URL = "http://localhost:3000"
$USER_ID = "6b867f4e-6461-416e-8f6c-13ae8e177070"

Write-Host "`n🎯 GOALS API QUICK TEST COMMANDS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Get User Goals
Write-Host "`n1️⃣  GET User Goals:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri `"$BASE_URL/api/goals?userId=$USER_ID`" -Method GET | ConvertTo-Json -Depth 10"

# 2. Analyze and Save Goal
Write-Host "`n2️⃣  POST Analyze and Save Goal:" -ForegroundColor Yellow
$goalData = @{
    userId = $USER_ID
    title = "Buy a Car"
    description = "Save for a new car purchase"
    targetAmount = 500000
    targetDate = "2027-12-31"
    riskTolerance = "Medium"
    saveToDatabase = $true
} | ConvertTo-Json

Write-Host "Invoke-RestMethod -Uri `"$BASE_URL/api/goals`" -Method POST -Body '$goalData' -ContentType 'application/json' | ConvertTo-Json -Depth 10"

# 3. Update Goal
Write-Host "`n3️⃣  PUT Update Goal (replace GOAL_ID):" -ForegroundColor Yellow
$updateData = @{
    currentSaved = 50000
    status = "active"
} | ConvertTo-Json

Write-Host "Invoke-RestMethod -Uri `"$BASE_URL/api/goals/GOAL_ID`" -Method PUT -Body '$updateData' -ContentType 'application/json' | ConvertTo-Json -Depth 10"

# 4. Delete Goal
Write-Host "`n4️⃣  DELETE Goal (replace GOAL_ID):" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri `"$BASE_URL/api/goals/GOAL_ID`" -Method DELETE"

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "💡 Tip: Run 'node test/test_goals_endpoint.js' for comprehensive testing`n" -ForegroundColor Green
