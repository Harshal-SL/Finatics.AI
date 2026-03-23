# Test chatbot for user 6b867f4e-6461-416e-8f6c-13ae8e177070
$userId = "6b867f4e-6461-416e-8f6c-13ae8e177070"
$apiBase = "http://localhost:3000/api/chatbot"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AI Chatbot Test - User with Linked Account" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "User ID: $userId`n" -ForegroundColor Yellow

# Query 1: Hello
Write-Host "[QUERY 1] 'hello'" -ForegroundColor Magenta
Write-Host "Sending request..." -ForegroundColor Gray
try {
    $body1 = @{
        userId = $userId
        query = "hello"
    } | ConvertTo-Json

    $response1 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body1 -ContentType 'application/json'
    
    Write-Host "[SUCCESS]" -ForegroundColor Green
    Write-Host "`nUser Financial Data:" -ForegroundColor Cyan
    Write-Host "  Savings: Rs.$($response1.metadata.userData.savings)" -ForegroundColor White
    Write-Host "  Expenses: Rs.$($response1.metadata.userData.expenses)" -ForegroundColor White
    Write-Host "  Surplus: Rs.$($response1.metadata.userData.surplus)" -ForegroundColor White
    
    Write-Host "`nAI Response:" -ForegroundColor Cyan
    Write-Host $response1.response -ForegroundColor White
    Write-Host "`nTimestamp: $($response1.metadata.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "Waiting 15 seconds before next query..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Query 2: Top 5 gains and losses
Write-Host "`n[QUERY 2] 'top 5 gains and loss in also 7 days'" -ForegroundColor Magenta
Write-Host "Sending request..." -ForegroundColor Gray
try {
    $body2 = @{
        userId = $userId
        query = "top 5 gains and loss in also 7 days"
    } | ConvertTo-Json

    $response2 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body2 -ContentType 'application/json'
    
    Write-Host "[SUCCESS]" -ForegroundColor Green
    Write-Host "`nUser Financial Data:" -ForegroundColor Cyan
    Write-Host "  Savings: Rs.$($response2.metadata.userData.savings)" -ForegroundColor White
    Write-Host "  Expenses: Rs.$($response2.metadata.userData.expenses)" -ForegroundColor White
    Write-Host "  Surplus: Rs.$($response2.metadata.userData.surplus)" -ForegroundColor White
    
    Write-Host "`nAI Response:" -ForegroundColor Cyan
    Write-Host $response2.response -ForegroundColor White
    Write-Host "`nTimestamp: $($response2.metadata.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "Waiting 15 seconds before next query..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Query 3: Investment advice with risk
Write-Host "`n[QUERY 3] 'where can i invest my savings to gain more return also give me the risk percentage'" -ForegroundColor Magenta
Write-Host "Sending request..." -ForegroundColor Gray
try {
    $body3 = @{
        userId = $userId
        query = "where can i invest my savings to gain more return also give me the risk percentage"
    } | ConvertTo-Json

    $response3 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body3 -ContentType 'application/json'
    
    Write-Host "[SUCCESS]" -ForegroundColor Green
    Write-Host "`nUser Financial Data:" -ForegroundColor Cyan
    Write-Host "  Savings: Rs.$($response3.metadata.userData.savings)" -ForegroundColor White
    Write-Host "  Expenses: Rs.$($response3.metadata.userData.expenses)" -ForegroundColor White
    Write-Host "  Surplus: Rs.$($response3.metadata.userData.surplus)" -ForegroundColor White
    
    Write-Host "`nAI Response:" -ForegroundColor Cyan
    Write-Host $response3.response -ForegroundColor White
    Write-Host "`nTimestamp: $($response3.metadata.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
