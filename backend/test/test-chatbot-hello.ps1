# PowerShell script to test chatbot
Write-Host "`nAI Chatbot Test for User 'hello'`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[1] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:3000/api/chatbot/health' -Method GET
    Write-Host "[OK] Health Status:" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Investment Query
Write-Host "[2] Testing Investment Query..." -ForegroundColor Yellow
try {
    $body = @{
        userId = "hello"
        query = "What should I invest in with my surplus money?"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/chatbot/query' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "[OK] Query: 'What should I invest in with my surplus money?'" -ForegroundColor Green
    Write-Host "`n[RESPONSE] Full Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host "`n[AI ANSWER]" -ForegroundColor Magenta
    Write-Host $response.response
} catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
}

Write-Host "`n"

# Test 3: Non-Finance Query
Write-Host "[3] Testing Non-Finance Query (Should be rejected)..." -ForegroundColor Yellow
try {
    $body = @{
        userId = "hello"
        query = "What is the weather today?"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/chatbot/query' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "[OK] Query: 'What is the weather today?'" -ForegroundColor Green
    Write-Host "`n[AI ANSWER]" -ForegroundColor Magenta
    Write-Host $response.response
} catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
}

Write-Host "`n"

# Test 4: Tax Planning Query
Write-Host "[4] Testing Tax Planning Query..." -ForegroundColor Yellow
try {
    $body = @{
        userId = "hello"
        query = "How can I save tax this year?"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/chatbot/query' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "[OK] Query: 'How can I save tax this year?'" -ForegroundColor Green
    Write-Host "`n[AI ANSWER]" -ForegroundColor Magenta
    Write-Host $response.response
} catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
}

Write-Host "`n[TESTS COMPLETE]`n" -ForegroundColor Green
