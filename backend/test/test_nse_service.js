/**
 * Test NSE India Stock Price Service
 */

require('dotenv').config();
const { fetchStockPrice, fetchMultipleStockPrices, extractSymbol } = require('../services/nseStockService');

async function testNSEService() {
  console.log('\n=== Testing NSE India Stock Price Service ===\n');
  
  try {
    // Test 1: Extract symbols from stock names
    console.log('1. Testing symbol extraction:');
    const testNames = [
      'Raju-De',
      'Sankaran-Chatterjee',
      'RELIANCE',
      'TCS Ltd',
      'INFY-EQ',
      'TATASTEEL'
    ];
    
    testNames.forEach(name => {
      const symbol = extractSymbol(name);
      console.log(`   "${name}" -> "${symbol}"`);
    });
    
    // Test 2: Fetch a single stock price
    console.log('\n2. Fetching single stock price (RELIANCE):');
    const relianceData = await fetchStockPrice('RELIANCE');
    
    if (relianceData.success) {
      console.log('   ✅ SUCCESS:');
      console.log(`   Company: ${relianceData.companyName}`);
      console.log(`   Symbol: ${relianceData.symbol}`);
      console.log(`   Last Price: ₹${relianceData.lastPrice}`);
      console.log(`   Change: ₹${relianceData.change} (${relianceData.pChange}%)`);
      console.log(`   Previous Close: ₹${relianceData.previousClose}`);
      console.log(`   Day High: ₹${relianceData.high}`);
      console.log(`   Day Low: ₹${relianceData.low}`);
      console.log(`   Source: ${relianceData.source}`);
      console.log(`   Last Updated: ${relianceData.lastUpdated}`);
    } else {
      console.log(`   ❌ FAILED: ${relianceData.error}`);
    }
    
    // Test 3: Fetch multiple stock prices
    console.log('\n3. Fetching multiple stock prices:');
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'TATASTEEL', 'SBIN'];
    console.log(`   Symbols: ${symbols.join(', ')}`);
    console.log('   (This may take a few seconds...)\n');
    
    const pricesMap = await fetchMultipleStockPrices(symbols);
    
    symbols.forEach(symbol => {
      const data = pricesMap[symbol];
      if (data && data.success) {
        console.log(`   ✅ ${symbol}: ₹${data.lastPrice} (${data.pChange >= 0 ? '+' : ''}${data.pChange}%)`);
      } else {
        console.log(`   ❌ ${symbol}: Failed - ${data?.error || 'Unknown error'}`);
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
  
  console.log('\n=== Test Complete ===\n');
}

// Run the test
testNSEService();
