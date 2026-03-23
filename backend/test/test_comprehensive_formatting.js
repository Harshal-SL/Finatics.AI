/**
 * Comprehensive test suite for AI response formatting
 * Tests multiple question types to ensure consistent SHORT responses
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_ID = 'c7fbe9ef-73d8-444a-9833-7e0c83b6abcd';

const testQuestions = [
  {
    name: "Goal Achievement (General)",
    question: "How can I achieve my financial goals faster?"
  },
  {
    name: "Investment Advice",
    question: "What are the best investment strategies?"
  },
  {
    name: "Stock Recommendations",
    question: "Which stocks should I invest in?"
  },
  {
    name: "Market News",
    question: "What's happening in the stock market today?"
  },
  {
    name: "Savings Tips",
    question: "How can I save more money?"
  }
];

async function testQuestion(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 TEST ${index + 1}: ${testCase.name}`);
  console.log(`Question: "${testCase.question}"`);
  console.log('─'.repeat(70));

  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message: testCase.question,
      userId: TEST_USER_ID
    });

    const aiResponse = response.data.data?.message || response.data.response;
    
    console.log('\n📝 AI RESPONSE:');
    console.log(aiResponse);
    
    console.log(`\n📏 Length: ${aiResponse.length} characters`);
    
    // Check for issues
    const hasMarkdown = aiResponse.includes('**') || aiResponse.includes('##') || aiResponse.includes('###');
    const hasTables = aiResponse.includes('|');
    const tooLong = aiResponse.length > 400;
    
    const status = (!hasMarkdown && !hasTables && !tooLong) ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status}`);
    
    if (hasMarkdown) console.log('  ❌ Contains markdown symbols');
    if (hasTables) console.log('  ❌ Contains tables');
    if (tooLong) console.log(`  ❌ Too long (${aiResponse.length} > 400 chars)`);
    
    return { pass: !hasMarkdown && !hasTables && !tooLong, length: aiResponse.length };

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
    return { pass: false, length: 0 };
  }
}

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE AI RESPONSE FORMATTING TEST SUITE');
  console.log('='.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < testQuestions.length; i++) {
    const result = await testQuestion(testQuestions[i], i);
    results.push(result);
    
    // Wait 1 second between requests
    if (i < testQuestions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.pass).length;
  const avgLength = Math.round(results.reduce((sum, r) => sum + r.length, 0) / results.length);
  
  console.log(`\nTotal Tests: ${testQuestions.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${testQuestions.length - passed} ❌`);
  console.log(`Average Response Length: ${avgLength} characters`);
  
  if (passed === testQuestions.length) {
    console.log('\n🎉 ALL TESTS PASSED! Responses are clean, short, and properly formatted.');
  } else {
    console.log('\n⚠️  Some tests failed. Review responses above.');
  }
  
  console.log('='.repeat(70));
}

// Wait for server, then run tests
setTimeout(runAllTests, 1000);
