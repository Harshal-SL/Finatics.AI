/**
 * Test both API keys and user-specific financial analysis
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test 1: Nifty 50 with primary key (should work or failover)
async function testNifty50() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: Nifty 50 Explanation');
  console.log('='.repeat(70));
  
  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message: "What is Nifty 50?",
      userId: "test-user-1"
    });

    const aiResponse = response.data.data?.message;
    console.log('\n📝 Response:');
    console.log(aiResponse);
    console.log(`\n📏 Length: ${aiResponse.length} characters`);
    
    const hasMarkdown = aiResponse.includes('**') || aiResponse.includes('##');
    console.log(`✅ Format: ${hasMarkdown ? '❌ Has markdown' : '✅ Clean'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test 2: User-specific financial analysis
async function testUserAnalysis() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: Personal Financial Analysis');
  console.log('User ID: f2ef5448-7749-4cd5-8aeb-17221ecd0eae');
  console.log('='.repeat(70));
  
  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message: "Analyse my details and suggest me the best action which I can take",
      userId: "f2ef5448-7749-4cd5-8aeb-17221ecd0eae"
    });

    const aiResponse = response.data.data?.message;
    console.log('\n📝 Response:');
    console.log(aiResponse);
    console.log(`\n📏 Length: ${aiResponse.length} characters`);
    
    const hasMarkdown = aiResponse.includes('**') || aiResponse.includes('##');
    const mentionsData = aiResponse.toLowerCase().includes('income') || 
                         aiResponse.toLowerCase().includes('expense') ||
                         aiResponse.toLowerCase().includes('saving') ||
                         aiResponse.toLowerCase().includes('₹');
    
    console.log(`✅ Format: ${hasMarkdown ? '❌ Has markdown' : '✅ Clean'}`);
    console.log(`✅ Personalized: ${mentionsData ? '✅ Uses user data' : '❌ Generic response'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test 3: Check which API key is being used (primary vs fallback)
async function testAPIKeyFailover() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: API Key Failover Test');
  console.log('='.repeat(70));
  
  // Make multiple rapid requests to test failover
  for (let i = 1; i <= 3; i++) {
    console.log(`\nRequest ${i}:`);
    try {
      const response = await axios.post(`${API_BASE}/chatbot`, {
        message: `Test question ${i}: What is stock market?`,
        userId: "test-user-failover"
      });

      const aiResponse = response.data.data?.message;
      console.log(`✅ Success - Response length: ${aiResponse.length} chars`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function runAllTests() {
  console.log('\n🧪 COMPREHENSIVE CHATBOT TESTING');
  console.log('Testing API key failover and personalized responses\n');
  
  await testNifty50();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testUserAnalysis();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testAPIKeyFailover();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS COMPLETE');
  console.log('='.repeat(70));
  console.log('\nCheck server logs to see which API key was used (primary vs fallback)');
}

// Wait for server, then run tests
setTimeout(runAllTests, 2000);
