/**
 * Test Real-Time Stock Prices with Holdings API
 */

const API_BASE_URL = 'http://localhost:3000/api';
const TEST_ACCOUNT_NUMBER = '5893143322';

async function testRealTimePrices() {
  console.log('\n=== Testing Real-Time Stock Prices ===\n');
  
  try {
    // Test 1: Get holdings WITHOUT real-time prices (database prices)
    console.log(`1. Fetching holdings with DATABASE prices...`);
    const response1 = await fetch(`${API_BASE_URL}/holdings/account/${TEST_ACCOUNT_NUMBER}`);
    const result1 = await response1.json();
    
    if (result1.success) {
      console.log('\n✅ SUCCESS: Holdings with database prices');
      console.log(`Realtime mode: ${result1.realtime}`);
      console.log(`\n📊 Holdings (Database Prices):`);
      result1.data.holdings.forEach((holding, index) => {
        console.log(`\n${index + 1}. ${holding.name} (${holding.symbol})`);
        console.log(`   Current Price: ₹${holding.current_price} (Source: ${holding.price_source})`);
        console.log(`   Gain/Loss: ₹${holding.gainLoss.toFixed(2)} (${holding.gainLossPercent.toFixed(2)}%)`);
      });
      console.log(`\n💰 Portfolio Summary (Database):`);
      console.log(`   Total Value: ₹${result1.data.summary.totalValue.toFixed(2)}`);
      console.log(`   Total Gain/Loss: ₹${result1.data.summary.totalGainLoss.toFixed(2)} (${result1.data.summary.totalGainLossPercent.toFixed(2)}%)`);
    } else {
      console.log('❌ FAILED:', result1.message);
      return;
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Get holdings WITH real-time prices from NSE India
    console.log(`2. Fetching holdings with REAL-TIME prices from NSE India...`);
    console.log('   (This may take a few seconds...)\n');
    
    const response2 = await fetch(`${API_BASE_URL}/holdings/account/${TEST_ACCOUNT_NUMBER}?realtime=true`);
    const result2 = await response2.json();
    
    if (result2.success) {
      console.log('✅ SUCCESS: Holdings with real-time prices');
      console.log(`Realtime mode: ${result2.realtime}`);
      console.log(`\n📊 Holdings (Live NSE India Prices):`);
      result2.data.holdings.forEach((holding, index) => {
        console.log(`\n${index + 1}. ${holding.name} (${holding.symbol})`);
        console.log(`   Bought Price: ₹${holding.bought_price}`);
        console.log(`   Current Price: ₹${holding.current_price} (Source: ${holding.price_source})`);
        
        if (holding.real_time_data) {
          console.log(`   Real-Time Data:`);
          console.log(`      - Last Price: ₹${holding.real_time_data.lastPrice}`);
          console.log(`      - Change: ₹${holding.real_time_data.change.toFixed(2)} (${holding.real_time_data.pChange.toFixed(2)}%)`);
          console.log(`      - Day High: ₹${holding.real_time_data.high}`);
          console.log(`      - Day Low: ₹${holding.real_time_data.low}`);
          console.log(`      - Previous Close: ₹${holding.real_time_data.previousClose}`);
          console.log(`      - Last Updated: ${holding.real_time_data.lastUpdated}`);
        }
        
        console.log(`   Investment: ₹${holding.investment.toFixed(2)}`);
        console.log(`   Current Value: ₹${holding.currentValue.toFixed(2)}`);
        console.log(`   Gain/Loss: ₹${holding.gainLoss.toFixed(2)} (${holding.gainLossPercent.toFixed(2)}%)`);
      });
      
      console.log(`\n💰 Portfolio Summary (Live Prices):`);
      console.log(`   Total Holdings: ${result2.data.summary.totalHoldings}`);
      console.log(`   Total Investment: ₹${result2.data.summary.totalInvestment.toFixed(2)}`);
      console.log(`   Total Value: ₹${result2.data.summary.totalValue.toFixed(2)}`);
      console.log(`   Total Gain/Loss: ₹${result2.data.summary.totalGainLoss.toFixed(2)} (${result2.data.summary.totalGainLossPercent.toFixed(2)}%)`);
      
      // Compare database vs real-time
      console.log(`\n📈 Comparison (Database vs Real-Time):`);
      const valueDiff = result2.data.summary.totalValue - result1.data.summary.totalValue;
      const gainDiff = result2.data.summary.totalGainLoss - result1.data.summary.totalGainLoss;
      console.log(`   Portfolio Value Difference: ₹${valueDiff.toFixed(2)}`);
      console.log(`   Gain/Loss Difference: ₹${gainDiff.toFixed(2)}`);
      
    } else {
      console.log('❌ FAILED:', result2.message);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
  
  console.log('\n=== Test Complete ===\n');
}

// Run the test
testRealTimePrices();
