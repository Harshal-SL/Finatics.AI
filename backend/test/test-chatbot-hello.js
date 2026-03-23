/**
 * Test AI Chatbot for user "hello"
 */

const testChatbotForHello = async () => {
  const API_BASE = 'http://localhost:3000/api';
  const userId = 'hello';
  
  console.log('🤖 Testing AI Chatbot for user "hello"\n');

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 1: Health Check
  console.log('1️⃣ Checking chatbot health...');
  try {
    const healthResponse = await fetch(`${API_BASE}/chatbot/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:');
    console.log(JSON.stringify(healthData, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('');
  }

  // Test 2: Investment Query
  console.log('2️⃣ Testing investment query...');
  try {
    const response = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        query: 'What should I invest in with my surplus money?'
      })
    });
    const data = await response.json();
    console.log('✅ Query: "What should I invest in with my surplus money?"');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n💬 AI Answer:');
    console.log(data.response);
    console.log('');
  } catch (error) {
    console.error('❌ Investment query failed:', error.message);
    console.log('');
  }

  // Test 3: Tax Planning Query
  console.log('3️⃣ Testing tax planning query...');
  try {
    const response = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        query: 'How can I save tax this year?'
      })
    });
    const data = await response.json();
    console.log('✅ Query: "How can I save tax this year?"');
    console.log('\n💬 AI Answer:');
    console.log(data.response);
    console.log('');
  } catch (error) {
    console.error('❌ Tax query failed:', error.message);
    console.log('');
  }

  // Test 4: Mutual Fund Query
  console.log('4️⃣ Testing mutual fund query...');
  try {
    const response = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        query: 'Should I invest in Nifty 50 index funds?'
      })
    });
    const data = await response.json();
    console.log('✅ Query: "Should I invest in Nifty 50 index funds?"');
    console.log('\n💬 AI Answer:');
    console.log(data.response);
    console.log('');
  } catch (error) {
    console.error('❌ Mutual fund query failed:', error.message);
    console.log('');
  }

  // Test 5: Non-Finance Query (Should be rejected)
  console.log('5️⃣ Testing non-finance query (should be rejected)...');
  try {
    const response = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        query: 'What is the weather today?'
      })
    });
    const data = await response.json();
    console.log('✅ Query: "What is the weather today?"');
    console.log('\n💬 AI Answer:');
    console.log(data.response);
    console.log('');
  } catch (error) {
    console.error('❌ Non-finance query test failed:', error.message);
    console.log('');
  }

  console.log('🎉 All chatbot tests completed for user "hello"!');
};

// Run tests
testChatbotForHello().catch(console.error);
