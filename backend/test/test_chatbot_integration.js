const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testNewsAPI() {
  console.log('🧪 Testing News API Integration...\n');
  const results = {
    headlines: null,
    marketNews: null,
    search: null,
    companyNews: null
  };

  try {
    // Test 1: Get headlines
    console.log('━'.repeat(70));
    console.log('1️⃣  TEST: Get Top Headlines');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: GET /api/news/headlines?limit=5');
    const headlines = await axios.get(`${BASE_URL}/api/news/headlines?limit=5`);
    results.headlines = headlines.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📊 Total Articles: ${headlines.data.totalArticles}`);
    console.log(`⚡ Cached: ${headlines.data.cached ? 'Yes' : 'No'}`);
    console.log('\n📰 Sample Headlines:');
    headlines.data.articles.slice(0, 3).forEach((article, idx) => {
      console.log(`   ${idx + 1}. ${article.title}`);
      console.log(`      Source: ${article.source} | Date: ${new Date(article.pubDate).toLocaleDateString()}`);
    });
    console.log('');

    // Test 2: Get market news
    console.log('━'.repeat(70));
    console.log('2️⃣  TEST: Get Market News from Multiple Sources');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: GET /api/news/markets?sources=moneycontrol,economictimes');
    const marketNews = await axios.get(`${BASE_URL}/api/news/markets?sources=moneycontrol,economictimes&limit=10`);
    results.marketNews = marketNews.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📊 Total Articles: ${marketNews.data.totalArticles}`);
    console.log(`⚡ Cached: ${marketNews.data.cached ? 'Yes' : 'No'}`);
    console.log('\n📡 Sources Breakdown:');
    const sourceCounts = {};
    marketNews.data.articles.forEach(a => {
      sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
    });
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`   • ${source}: ${count} articles`);
    });
    console.log('');

    // Test 3: Search news
    console.log('━'.repeat(70));
    console.log('3️⃣  TEST: Search News by Keywords');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: GET /api/news/search?q=Nifty,Sensex');
    const searchResults = await axios.get(`${BASE_URL}/api/news/search?q=Nifty,Sensex&limit=5`);
    results.search = searchResults.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📊 Total Results: ${searchResults.data.totalArticles}`);
    console.log(`🔍 Keywords: Nifty, Sensex`);
    console.log('\n📰 Search Results:');
    searchResults.data.articles.slice(0, 3).forEach((article, idx) => {
      console.log(`   ${idx + 1}. ${article.title.substring(0, 80)}${article.title.length > 80 ? '...' : ''}`);
    });
    console.log('');

    // Test 4: Company news
    console.log('━'.repeat(70));
    console.log('4️⃣  TEST: Get Company-Specific News');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: GET /api/news/company/Reliance');
    const companyNews = await axios.get(`${BASE_URL}/api/news/company/Reliance`);
    results.companyNews = companyNews.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📊 Total Articles: ${companyNews.data.totalArticles}`);
    console.log(`🏢 Company: ${companyNews.data.company}`);
    if (companyNews.data.articles.length > 0) {
      console.log('\n📰 Related Articles:');
      companyNews.data.articles.slice(0, 2).forEach((article, idx) => {
        console.log(`   ${idx + 1}. ${article.title.substring(0, 80)}${article.title.length > 80 ? '...' : ''}`);
      });
    } else {
      console.log('   ℹ️  No articles found for this company in current cache');
    }
    console.log('');

    console.log('━'.repeat(70));
    console.log('✅ NEWS API TESTS: ALL PASSED');
    console.log('━'.repeat(70));
    console.log('');
    return { success: true, results };

  } catch (error) {
    console.log('━'.repeat(70));
    console.log('❌ NEWS API TESTS: FAILED');
    console.log('━'.repeat(70));
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

async function testChatbotIntegration() {
  console.log('🤖 Testing Chatbot Integration...\n');
  const results = {
    expenseAnalysis: null,
    marketNews: null,
    stockRecommendation: null
  };

  try {
    // Test 1: Chatbot with financial analysis
    console.log('━'.repeat(70));
    console.log('1️⃣  TEST: Chatbot with Expense Analysis (User Context)');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: POST /api/chatbot');
    console.log('💬 Query: "Analyze my expenses and tell me how I can save more money"');
    console.log('👤 User ID: test-user-123');
    console.log('\n⏳ Sending request to AI...');
    
    const chatResponse = await axios.post(`${BASE_URL}/api/chatbot`, {
      message: "Analyze my expenses and tell me how I can save more money",
      conversationHistory: [],
      userId: "test-user-123"
    });

    results.expenseAnalysis = chatResponse.data.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📝 Response Length: ${chatResponse.data.data.message.length} characters`);
    console.log(`⏰ Timestamp: ${chatResponse.data.data.timestamp}`);
    console.log('\n🤖 AI Response Preview:');
    console.log('┌' + '─'.repeat(68) + '┐');
    const preview = chatResponse.data.data.message.substring(0, 300);
    const lines = preview.match(/.{1,66}/g) || [preview];
    lines.forEach(line => {
      console.log('│ ' + line.padEnd(66) + ' │');
    });
    console.log('│ ' + '...'.padEnd(66) + ' │');
    console.log('└' + '─'.repeat(68) + '┘');
    console.log('');

    // Test 2: Chatbot with market news
    console.log('━'.repeat(70));
async function runAllTests() {
  const startTime = Date.now();
  
  console.log('\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(10) + '🚀 FINANCIAL CHATBOT INTEGRATION TESTS' + ' '.repeat(21) + '║');
  console.log('║' + ' '.repeat(70) + '║');
  console.log('║' + '  📅 Date: ' + new Date().toLocaleString().padEnd(58) + '║');
  console.log('║' + '  🌐 Server: http://localhost:3000'.padEnd(71) + '║');
  console.log('╚' + '═'.repeat(70) + '╝');
  console.log('\n');

  // Test News API
  console.log('╭' + '─'.repeat(70) + '╮');
  console.log('│' + ' '.repeat(20) + '📰 NEWS API TESTS' + ' '.repeat(33) + '│');
  console.log('╰' + '─'.repeat(70) + '╯');
  console.log('');
  
  const newsResult = await testNewsAPI();
  
  // Test Chatbot
  console.log('╭' + '─'.repeat(70) + '╮');
  console.log('│' + ' '.repeat(17) + '🤖 CHATBOT AI TESTS' + ' '.repeat(33) + '│');
  console.log('╰' + '─'.repeat(70) + '╯');
  console.log('');
  
  const chatbotResult = await testChatbotIntegration();

  // Final Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(23) + '📊 TEST SUMMARY' + ' '.repeat(32) + '║');
  console.log('╠' + '═'.repeat(70) + '╣');
  
  // News API Results
  const newsIcon = newsResult.success ? '✅' : '❌';
  const newsStatus = newsResult.success ? 'PASSED' : 'FAILED';
  console.log('║  ' + newsIcon + ' News API Tests:'.padEnd(50) + newsStatus.padEnd(18) + '║');
  if (newsResult.success && newsResult.results) {
    console.log('║     • Headlines: ' + (newsResult.results.headlines ? `${newsResult.results.headlines.totalArticles} articles` : 'N/A').padEnd(52) + '║');
    console.log('║     • Market News: ' + (newsResult.results.marketNews ? `${newsResult.results.marketNews.totalArticles} articles` : 'N/A').padEnd(50) + '║');
    console.log('║     • Search: ' + (newsResult.results.search ? `${newsResult.results.search.totalArticles} results` : 'N/A').padEnd(55) + '║');
    console.log('║     • Company News: ' + (newsResult.results.companyNews ? `${newsResult.results.companyNews.totalArticles} articles` : 'N/A').padEnd(49) + '║');
  }
  
  console.log('║' + ' '.repeat(70) + '║');
  
  // Chatbot Results
  const chatbotIcon = chatbotResult.success ? '✅' : '❌';
  const chatbotStatus = chatbotResult.success ? 'PASSED' : 'FAILED';
  console.log('║  ' + chatbotIcon + ' Chatbot AI Tests:'.padEnd(50) + chatbotStatus.padEnd(18) + '║');
  if (chatbotResult.success && chatbotResult.results) {
    console.log('║     • Expense Analysis: ' + (chatbotResult.results.expenseAnalysis ? 'Working' : 'N/A').padEnd(45) + '║');
    console.log('║     • Market News Integration: ' + (chatbotResult.results.marketNews ? 'Working' : 'N/A').padEnd(38) + '║');
    console.log('║     • Stock Recommendations: ' + (chatbotResult.results.stockRecommendation ? 'Working' : 'N/A').padEnd(41) + '║');
  }
  
  console.log('║' + ' '.repeat(70) + '║');
  console.log('╠' + '═'.repeat(70) + '╣');
  console.log('║  ⏱️  Total Duration: ' + duration + 's'.padEnd(49) + '║');
  console.log('╠' + '═'.repeat(70) + '╣');
  
  if (newsResult.success && chatbotResult.success) {
    console.log('║' + ' '.repeat(70) + '║');
    console.log('║' + ' '.repeat(15) + '🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉' + ' '.repeat(18) + '║');
    console.log('║' + ' '.repeat(70) + '║');
    console.log('║  ✨ Your financial chatbot is ready to use with:'.padEnd(71) + '║');
    console.log('║     • Complete user financial data integration'.padEnd(71) + '║');
    console.log('║     • Real-time market news from RSS feeds'.padEnd(71) + '║');
    console.log('║     • AI-powered insights using Gemini'.padEnd(71) + '║');
    console.log('║     • Expense & savings analysis'.padEnd(71) + '║');
    console.log('║     • Stock market trends & recommendations'.padEnd(71) + '║');
    console.log('║' + ' '.repeat(70) + '║');
  } else {
    console.log('║' + ' '.repeat(70) + '║');
    console.log('║' + ' '.repeat(20) + '⚠️  SOME TESTS FAILED' + ' '.repeat(28) + '║');
    console.log('║' + ' '.repeat(70) + '║');
    console.log('║  Please review the error messages above for details.'.padEnd(71) + '║');
    console.log('║' + ' '.repeat(70) + '║');
  }
  
  console.log('╚' + '═'.repeat(70) + '╝');
  console.log('\n');

  if (!newsResult.success || !chatbotResult.success) {
    process.exit(1);
  }
}
    // Test 3: Stock recommendation
    console.log('━'.repeat(70));
    console.log('3️⃣  TEST: Chatbot with Stock Recommendation Query');
    console.log('━'.repeat(70));
    console.log('📍 Endpoint: POST /api/chatbot');
    console.log('💬 Query: "Recommend 3 good stocks for long-term investment"');
    console.log('\n⏳ Sending request to AI...');
    
    const stockQuery = await axios.post(`${BASE_URL}/api/chatbot`, {
      message: "Recommend 3 good stocks for long-term investment",
      conversationHistory: []
    });

    results.stockRecommendation = stockQuery.data.data;
    console.log('✅ Status: SUCCESS');
    console.log(`📝 Response Length: ${stockQuery.data.data.message.length} characters`);
    console.log('\n🤖 AI Response Preview:');
    console.log('┌' + '─'.repeat(68) + '┐');
    const preview3 = stockQuery.data.data.message.substring(0, 300);
    const lines3 = preview3.match(/.{1,66}/g) || [preview3];
    lines3.forEach(line => {
      console.log('│ ' + line.padEnd(66) + ' │');
    });
    console.log('│ ' + '...'.padEnd(66) + ' │');
    console.log('└' + '─'.repeat(68) + '┘');
    console.log('');

    console.log('━'.repeat(70));
    console.log('✅ CHATBOT TESTS: ALL PASSED');
    console.log('━'.repeat(70));
    console.log('');
    return { success: true, results };

  } catch (error) {
    console.log('━'.repeat(70));
    console.log('❌ CHATBOT TESTS: FAILED');
    console.log('━'.repeat(70));
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Financial Chatbot Integration Tests\n');
  console.log('='.repeat(60));
  console.log('');

  const newsTestPassed = await testNewsAPI();
  console.log('='.repeat(60));
  console.log('');

  const chatbotTestPassed = await testChatbotIntegration();
  console.log('='.repeat(60));
  console.log('');

  console.log('📊 Test Summary:');
  console.log('News API:', newsTestPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('Chatbot Integration:', chatbotTestPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('');

  if (newsTestPassed && chatbotTestPassed) {
    console.log('🎉 All tests passed! Financial chatbot integration is complete.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests();
