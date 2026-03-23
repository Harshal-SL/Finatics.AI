/**
 * Test Holdings API with specific user credentials
 */

const API_BASE_URL = 'http://localhost:3000/api';
const USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const ACCOUNT_NUMBER = '5893143322';

async function testHoldingsAPI() {
  console.log('🧪 Testing Holdings API...\n');
  console.log('User ID:', USER_ID);
  console.log('Account Number:', ACCOUNT_NUMBER);

  try {
    // Test 1: Get holdings by user ID (the main endpoint)
    console.log('\n1️⃣ Testing GET /api/holdings/user/:userId');
    console.log(`   URL: ${API_BASE_URL}/holdings/user/${USER_ID}`);
    
    const response1 = await fetch(`${API_BASE_URL}/holdings/user/${USER_ID}`);
    const data1 = await response1.json();
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Success: ${data1.success}`);
    
    if (!data1.success) {
      console.log(`   ❌ Error: ${data1.message}`);
      console.log(`   Details:`, data1.error);
    } else {
      console.log(`   ✅ Holdings found: ${data1.data.holdings.length}`);
      console.log(`   Customer: ${data1.data.customer.full_name}`);
      console.log(`   Total Value: ₹${data1.data.summary.totalValue}`);
    }

    // Test 2: Get holdings by account number (fallback endpoint)
    console.log('\n2️⃣ Testing GET /api/holdings/account/:accountNumber');
    console.log(`   URL: ${API_BASE_URL}/holdings/account/${ACCOUNT_NUMBER}`);
    
    const response2 = await fetch(`${API_BASE_URL}/holdings/account/${ACCOUNT_NUMBER}`);
    const data2 = await response2.json();
    
    console.log(`   Status: ${response2.status}`);
    console.log(`   Success: ${data2.success}`);
    
    if (!data2.success) {
      console.log(`   ❌ Error: ${data2.message}`);
    } else {
      console.log(`   ✅ Holdings found: ${data2.data.holdings.length}`);
      console.log(`   Customer: ${data2.data.customer.full_name}`);
      console.log(`   Total Value: ₹${data2.data.summary.totalValue}`);
      
      console.log('\n📊 Holdings Details:');
      data2.data.holdings.forEach((h, i) => {
        console.log(`   ${i + 1}. ${h.name}`);
        console.log(`      Quantity: ${h.quantity}`);
        console.log(`      Current Price: ₹${h.current_price}`);
        console.log(`      Gain/Loss: ₹${h.gainLoss} (${h.gainLossPercent}%)`);
      });
    }

    // Test 3: Get with real-time prices
    console.log('\n3️⃣ Testing GET /api/holdings/account/:accountNumber?realtime=true');
    console.log(`   URL: ${API_BASE_URL}/holdings/account/${ACCOUNT_NUMBER}?realtime=true`);
    
    const response3 = await fetch(`${API_BASE_URL}/holdings/account/${ACCOUNT_NUMBER}?realtime=true`);
    const data3 = await response3.json();
    
    console.log(`   Status: ${response3.status}`);
    console.log(`   Realtime: ${data3.realtime}`);
    
    if (data3.success) {
      const hasRealtime = data3.data.holdings.some(h => h.price_source === 'realtime');
      console.log(`   ${hasRealtime ? '✅' : '⚠️ '} Real-time prices: ${hasRealtime ? 'Yes' : 'No (fallback to DB)'}`);
    }

    console.log('\n✨ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHoldingsAPI();
