const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testResponseFormatting() {
  console.log('\n🧪 Testing Chatbot Response Formatting\n');
  console.log('='.repeat(70));
  
  try {
    // Test 1: Stock recommendation
    console.log('\n📊 TEST 1: Stock Recommendations (Should be SHORT)\n');
    const stockResponse = await axios.post(`${BASE_URL}/api/chatbot`, {
      message: "Recommend top 5 Indian stocks for investment",
      conversationHistory: []
    });
    
    console.log('✅ Response received\n');
    console.log('📝 FORMATTED RESPONSE:');
    console.log('─'.repeat(70));
    console.log(stockResponse.data.data.message);
    console.log('─'.repeat(70));
    console.log(`\n📏 Length: ${stockResponse.data.data.message.length} characters`);
    console.log(`⏱️  Response time: ${new Date(stockResponse.data.data.timestamp).toLocaleString()}\n`);

    // Test 2: Market news query
    console.log('='.repeat(70));
    console.log('\n📰 TEST 2: Market News Query (Should be CONCISE)\n');
    const newsResponse = await axios.post(`${BASE_URL}/api/chatbot`, {
      message: "What's happening in the stock market?",
      conversationHistory: []
    });
    
    console.log('✅ Response received\n');
    console.log('📝 FORMATTED RESPONSE:');
    console.log('─'.repeat(70));
    console.log(newsResponse.data.data.message);
    console.log('─'.repeat(70));
    console.log(`\n📏 Length: ${newsResponse.data.data.message.length} characters\n`);

    // Test 3: Expense analysis
    console.log('='.repeat(70));
    console.log('\n💰 TEST 3: Expense Analysis (Should be ACTIONABLE)\n');
    const expenseResponse = await axios.post(`${BASE_URL}/api/chatbot`, {
      message: "How can I save more money?",
      conversationHistory: [],
      userId: "test-user-123"
    });
    
    console.log('✅ Response received\n');
    console.log('📝 FORMATTED RESPONSE:');
    console.log('─'.repeat(70));
    console.log(expenseResponse.data.data.message);
    console.log('─'.repeat(70));
    console.log(`\n📏 Length: ${expenseResponse.data.data.message.length} characters\n`);

    console.log('='.repeat(70));
    console.log('\n✅ FORMATTING TESTS COMPLETE!\n');
    console.log('Check the responses above for:');
    console.log('  • No ** or ## markdown symbols');
    console.log('  • Short, concise answers');
    console.log('  • Clean bullet points with •');
    console.log('  • Easy to read structure\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    }
  }
}

// Run test
testResponseFormatting();
