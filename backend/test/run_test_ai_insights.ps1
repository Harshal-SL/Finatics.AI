# Test AI Insights Integration
# Tests the complete flow from backend to frontend

Write-Host "🧪 Testing AI Insights Integration" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend API
Write-Host "1️⃣ Testing Backend API Endpoint..." -ForegroundColor Yellow
node ../test/test_ai_insights.js

Write-Host ""
Write-Host "✅ Backend test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure backend server is running: npm start"
Write-Host "   2. Make sure frontend is running in FrontEnd folder: npm run dev"
Write-Host "   3. Visit http://localhost:5174/stocks"
Write-Host "   4. AI Insights should appear in the right sidebar"
Write-Host ""
Write-Host "🔑 To enable live Gemini AI (optional):" -ForegroundColor Yellow
Write-Host "   1. Get API key from https://aistudio.google.com/app/apikey"
Write-Host "   2. Add to .env: GEMINI_API_KEY=your_key_here"
Write-Host "   3. Restart backend server"
Write-Host ""
