@echo off
echo ========================================
echo AI Chatbot Test for User "hello"
echo ========================================
echo.

REM Wait for server to be ready
timeout /t 3 /nobreak > nul

echo [1] Testing Health Endpoint...
curl -s http://localhost:3000/api/chatbot/health
echo.
echo.

echo [2] Testing Investment Query...
curl -s -X POST http://localhost:3000/api/chatbot/query ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"hello\",\"query\":\"What should I invest in with my surplus money?\"}"
echo.
echo.

echo [3] Testing Tax Query...
curl -s -X POST http://localhost:3000/api/chatbot/query ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"hello\",\"query\":\"How can I save tax?\"}"
echo.
echo.

echo [4] Testing Non-Finance Query (should be rejected)...
curl -s -X POST http://localhost:3000/api/chatbot/query ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"hello\",\"query\":\"What is the weather today?\"}"
echo.
echo.

echo ========================================
echo Tests Complete!
echo ========================================
