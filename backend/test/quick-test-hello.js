/**
 * Quick chatbot test for user "hello"
 */

console.log('🤖 Testing Chatbot for user "hello"\n');

setTimeout(async () => {
  try {
    // Test 1: Health Check
    console.log('1️⃣ Health Check...');
    const health = await fetch('http://localhost:3000/api/chatbot/health');
    const healthData = await health.json();
    console.log('✅', JSON.stringify(healthData, null, 2), '\n');

    // Test 2: Investment Query
    console.log('2️⃣ Investment Query: "What should I invest in with my surplus money?"');
    const res1 = await fetch('http://localhost:3000/api/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'hello',
        query: 'What should I invest in with my surplus money?'
      })
    });
    const data1 = await res1.json();
    console.log('📊 Response:', JSON.stringify(data1, null, 2));
    console.log('💬 AI Answer:\n' + data1.response + '\n');

    // Test 3: Non-Finance Query
    console.log('3️⃣ Non-Finance Query: "What is the weather?"');
    const res2 = await fetch('http://localhost:3000/api/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'hello',
        query: 'What is the weather?'
      })
    });
    const data2 = await res2.json();
    console.log('💬 AI Answer:\n' + data2.response + '\n');

    console.log('🎉 Tests Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}, 1000);
