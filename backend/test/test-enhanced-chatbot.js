/**
 * Comprehensive Test Script for Enhanced Gemini Chatbot
 * Tests all new features: stock analysis, market trends, sentiment analysis, etc.
 */

require('dotenv').config();
const { getChatResponse } = require('../services/ai/chatbotService');
const { getMarketTrends } = require('../services/marketTrendsService');
const { fetchHistoricalPrices, fetchAllIndices } = require('../services/nseStockService');
const { analyzeStock, performTechnicalAnalysis } = require('../services/marketAnalysisService');
const { getTopNewsWithSentiment, analyzeNewsSentiment } = require('../services/newsService');

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

/**
 * Test 1: Market Trends Service
 */
async function testMarketTrends() {
  section('TEST 1: Market Trends Service');
  
  try {
    log('Fetching comprehensive market trends...', 'cyan');
    const trends = await getMarketTrends();
    
    if (trends.success) {
      log('✓ Market trends fetched successfully', 'green');
      console.log('\nNifty 50:', trends.nifty50);
      console.log('Sensex:', trends.sensex);
      console.log('Overall Sentiment:', trends.overallSentiment);
      console.log('VIX:', trends.vix, `(${trends.vixTrend})`);
      console.log('\nTop 3 Gainers:');
      trends.topGainers.slice(0, 3).forEach((stock, i) => {
        console.log(`  ${i + 1}. ${stock.symbol}: +${stock.pChange}%`);
      });
      console.log('\nTop 3 Losers:');
      trends.topLosers.slice(0, 3).forEach((stock, i) => {
        console.log(`  ${i + 1}. ${stock.symbol}: ${stock.pChange}%`);
      });
      console.log('\nSector Performance:');
      trends.sectors.slice(0, 5).forEach((sector, i) => {
        console.log(`  ${i + 1}. ${sector.name}: ${sector.change}% (${sector.trend})`);
      });
      return true;
    } else {
      log('✗ Failed to fetch market trends: ' + trends.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error: ' + error.message, 'red');
    return false;
  }
}

/**
 * Test 2: Stock Analysis with Technical Indicators
 */
async function testStockAnalysis() {
  section('TEST 2: Stock Analysis with Technical Indicators');
  
  try {
    const symbol = 'RELIANCE.NS';
    log(`Analyzing ${symbol}...`, 'cyan');
    
    // Fetch historical data
    const historicalData = await fetchHistoricalPrices(symbol, 90);
    
    if (historicalData.success) {
      log(`✓ Fetched ${historicalData.dataPoints} days of historical data`, 'green');
      
      // Perform technical analysis
      const analysis = performTechnicalAnalysis(symbol, historicalData.prices);
      
      if (analysis.error) {
        log('✗ Technical analysis failed: ' + analysis.error, 'red');
        return false;
      }
      
      log('✓ Technical analysis completed', 'green');
      console.log('\nCurrent Price:', analysis.currentPrice);
      console.log('\nTechnical Indicators:');
      console.log('  RSI (14):', analysis.technicalIndicators.rsi, `(${analysis.signals.rsi})`);
      console.log('  MACD:', analysis.technicalIndicators.macd.value, `(${analysis.signals.macd})`);
      console.log('  MA20:', analysis.technicalIndicators.ma20);
      console.log('  MA50:', analysis.technicalIndicators.ma50);
      console.log('  Bollinger Bands:', 
        `Upper: ${analysis.technicalIndicators.bollingerBands.upper}`, 
        `| Lower: ${analysis.technicalIndicators.bollingerBands.lower}`
      );
      console.log('\nTrend:', analysis.trend);
      console.log('Recommendation:', analysis.recommendation);
      console.log('Score:', analysis.score);
      return true;
    } else {
      log('✗ Failed to fetch historical data: ' + historicalData.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error: ' + error.message, 'red');
    return false;
  }
}

/**
 * Test 3: News Sentiment Analysis
 */
async function testNewsSentiment() {
  section('TEST 3: News Sentiment Analysis');
  
  try {
    log('Fetching top news with sentiment analysis...', 'cyan');
    const news = await getTopNewsWithSentiment(5, true);
    
    if (news.success && news.articles.length > 0) {
      log(`✓ Analyzed sentiment for ${news.articles.length} articles`, 'green');
      console.log('\nTop News with Sentiment:');
      news.articles.forEach((article, i) => {
        console.log(`\n${i + 1}. ${article.title}`);
        console.log(`   Sentiment: ${article.sentiment} (Confidence: ${article.sentimentConfidence}%)`);
        console.log(`   Impact: ${article.impact}`);
        console.log(`   Reason: ${article.impactReason}`);
        console.log(`   Source: ${article.source}`);
      });
      return true;
    } else {
      log('✗ Failed to fetch news: ' + (news.error || 'No articles'), 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error: ' + error.message, 'red');
    return false;
  }
}

/**
 * Test 4: Chatbot Responses (Different Query Types)
 */
async function testChatbotResponses() {
  section('TEST 4: Chatbot Responses (Different Query Types)');
  
  const testQueries = [
    {
      type: 'Stock Analysis',
      message: 'Should I buy Reliance stock right now? What is the technical analysis saying?'
    },
    {
      type: 'Market Trends',
      message: 'What are the current market trends? Which sectors are performing well?'
    },
    {
      type: 'General Advice',
      message: 'What is a good savings rate for a 30-year-old?'
    },
    {
      type: 'Quick Query',
      message: 'What is Nifty 50?'
    }
  ];

  let passCount = 0;
  
  for (const query of testQueries) {
    try {
      log(`\nTesting ${query.type}:`, 'yellow');
      log(`Question: "${query.message}"`, 'cyan');
      
      const response = await getChatResponse(query.message, [], null, null);
      
      if (response && response.message) {
        log('✓ Response received', 'green');
        console.log(`\nAI Response (${response.message.length} chars):`);
        console.log(response.message);
        console.log(`\nQuery Type Detected: ${response.queryType || 'N/A'}`);
        console.log(`Model Used: ${response.model}`);
        if (response.contextUsed) {
          console.log('Context Used:', JSON.stringify(response.contextUsed, null, 2));
        }
        passCount++;
      } else {
        log('✗ No response received', 'red');
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }
  }
  
  log(`\nPassed ${passCount}/${testQueries.length} chatbot tests`, passCount === testQueries.length ? 'green' : 'yellow');
  return passCount === testQueries.length;
}

/**
 * Test 5: Index Data Fetching
 */
async function testIndices() {
  section('TEST 5: Major Indices Data');
  
  try {
    log('Fetching all major indices...', 'cyan');
    const indices = await fetchAllIndices();
    
    if (indices.success) {
      log('✓ All indices fetched successfully', 'green');
      console.log('\nNifty 50:', indices.nifty50);
      console.log('Sensex:', indices.sensex);
      console.log('Bank Nifty:', indices.bankNifty);
      console.log('India VIX:', indices.indiaVIX);
      return true;
    } else {
      log('✗ Failed to fetch indices: ' + indices.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error: ' + error.message, 'red');
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n' + '='.repeat(80), 'bright');
  log('ENHANCED GEMINI CHATBOT - COMPREHENSIVE TEST SUITE', 'bright');
  log('='.repeat(80), 'bright');
  
  const results = {
    marketTrends: false,
    stockAnalysis: false,
    newsSentiment: false,
    chatbotResponses: false,
    indices: false
  };

  // Run tests sequentially
  results.indices = await testIndices();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.marketTrends = await testMarketTrends();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.stockAnalysis = await testStockAnalysis();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.newsSentiment = await testNewsSentiment();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.chatbotResponses = await testChatbotResponses();
  
  // Summary
  section('TEST SUMMARY');
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('Test Results:');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${status} - ${test}`, color);
  });
  
  console.log('');
  log(`Overall: ${passCount}/${totalTests} tests passed`, passCount === totalTests ? 'green' : 'yellow');
  
  if (passCount === totalTests) {
    log('\n🎉 All tests passed! Enhanced chatbot is fully functional.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log('\n✗ Test suite failed: ' + error.message, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testMarketTrends,
  testStockAnalysis,
  testNewsSentiment,
  testChatbotResponses,
  testIndices
};
