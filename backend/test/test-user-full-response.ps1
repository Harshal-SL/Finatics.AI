# Test chatbot with full response logging
$userId = "6b867f4e-6461-416e-8f6c-13ae8e177070"
$apiBase = "http://localhost:3000/api/chatbot"
$results = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AI Chatbot Test - Full Response Capture" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "User ID: $userId`n" -ForegroundColor Yellow

# Query 1: Hello
Write-Host "[1/3] Testing: 'hello'" -ForegroundColor Magenta
try {
    $body1 = @{ userId = $userId; query = "hello" } | ConvertTo-Json
    $response1 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body1 -ContentType 'application/json'
    
    Write-Host "SUCCESS - Response received" -ForegroundColor Green
    Write-Host "Savings: Rs.$($response1.metadata.userData.savings) | Expenses: Rs.$($response1.metadata.userData.expenses) | Surplus: Rs.$($response1.metadata.userData.surplus)" -ForegroundColor Cyan
    Write-Host "`nFull AI Response:" -ForegroundColor Yellow
    Write-Host $response1.response -ForegroundColor White
    
    $results += @{
        query = "hello"
        response = $response1
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host "`n[Waiting 15 seconds...]" -ForegroundColor Gray
Start-Sleep -Seconds 15

# Query 2: Gains and losses
Write-Host "`n[2/3] Testing: 'top 5 gains and loss in also 7 days'" -ForegroundColor Magenta
try {
    $body2 = @{ userId = $userId; query = "top 5 gains and loss in also 7 days" } | ConvertTo-Json
    $response2 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body2 -ContentType 'application/json'
    
    Write-Host "SUCCESS - Response received" -ForegroundColor Green
    Write-Host "Savings: Rs.$($response2.metadata.userData.savings) | Expenses: Rs.$($response2.metadata.userData.expenses) | Surplus: Rs.$($response2.metadata.userData.surplus)" -ForegroundColor Cyan
    Write-Host "`nFull AI Response:" -ForegroundColor Yellow
    Write-Host $response2.response -ForegroundColor White
    
    $results += @{
        query = "top 5 gains and loss in also 7 days"
        response = $response2
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host "`n[Waiting 15 seconds...]" -ForegroundColor Gray
Start-Sleep -Seconds 15

# Query 3: Investment advice with risk
Write-Host "`n[3/3] Testing: 'where can i invest my savings to gain more return also give me the risk percentage'" -ForegroundColor Magenta
try {
    $body3 = @{ userId = $userId; query = "where can i invest my savings to gain more return also give me the risk percentage" } | ConvertTo-Json
    $response3 = Invoke-RestMethod -Uri "$apiBase/query" -Method POST -Body $body3 -ContentType 'application/json'
    
    Write-Host "SUCCESS - Response received" -ForegroundColor Green
    Write-Host "Savings: Rs.$($response3.metadata.userData.savings) | Expenses: Rs.$($response3.metadata.userData.expenses) | Surplus: Rs.$($response3.metadata.userData.surplus)" -ForegroundColor Cyan
    Write-Host "`nFull AI Response:" -ForegroundColor Yellow
    Write-Host $response3.response -ForegroundColor White
    
    $results += @{
        query = "where can i invest my savings to gain more return also give me the risk percentage"
        response = $response3
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# Save detailed results to JSON file
$outputFile = "d:\finai\backend\test\test-results-$userId.json"
$results | ConvertTo-Json -Depth 10 | Out-File $outputFile -Encoding UTF8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Full results saved to: test\test-results-$userId.json" -ForegroundColor Yellow
Write-Host "Total queries tested: $($results.Count)" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
