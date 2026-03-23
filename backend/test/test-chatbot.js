/**
 * Test script for AI Chatbot
 * Tests the Gemini-powered finance advisor chatbot
 */

const testChatbot = async () => {
  const API_BASE = 'http://localhost:3000/api';
  
  console.log('🤖 Testing AI Chatbot Integration\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing chatbot health...');
  try {
    const healthResponse = await fetch(`${API_BASE}/chatbot/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData);
    console.log('');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('');
  }

  // Test 2: Finance Query
  console.log('2️⃣ Testing finance query...');
  try {
    const queryResponse = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id', // Replace with actual user ID
        query: 'What should I do with my surplus money?'
      })
    });
    const queryData = await queryResponse.json();
    console.log('✅ Chatbot Response:', queryData);
    console.log('');
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.log('');
  }

  // Test 3: Non-Finance Query
  console.log('3️⃣ Testing non-finance query...');
  try {
    const nonFinanceResponse = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        query: 'What is the weather today?'
      })
    });
    const nonFinanceData = await nonFinanceResponse.json();
    console.log('✅ Non-Finance Response:', nonFinanceData);
    console.log('');
  } catch (error) {
    console.error('❌ Non-finance query failed:', error.message);
    console.log('');
  }

  // Test 4: Investment Advice Query
  console.log('4️⃣ Testing investment advice...');
  try {
    const investmentResponse = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        query: 'Should I invest in Nifty 50 index funds or direct stocks?'
      })
    });
    const investmentData = await investmentResponse.json();
    console.log('✅ Investment Advice:', investmentData);
    console.log('');
  } catch (error) {
    console.error('❌ Investment query failed:', error.message);
    console.log('');
  }

  console.log('🎉 Chatbot tests completed!');
};

// Run tests
testChatbot().catch(console.error);
