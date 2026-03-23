/**
 * Test Script for Holdings API
 * Tests fetching holdings for specific user and account
 */

const API_BASE_URL = 'http://localhost:3000/api';

// User details from requirement
const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const TEST_ACCOUNT_NUMBER = '5893143322';

async function testGetUserHoldings() {
  console.log('\n=== Testing Holdings API ===\n');
  
  try {
    // Test 1: Get holdings by account number (RECOMMENDED METHOD)
    console.log(`1. Fetching holdings by account number: ${TEST_ACCOUNT_NUMBER}`);
    const response1 = await fetch(`${API_BASE_URL}/holdings/account/${TEST_ACCOUNT_NUMBER}`);
    const result1 = await response1.json();
    
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    
    if (result1.success) {
      console.log('\n✅ SUCCESS: Holdings fetched successfully');
      console.log(`Customer: ${result1.data.customer.full_name} (${result1.data.customer.email})`);
      console.log(`Bank Account: ${result1.data.bankAccount.bank_name} - ${result1.data.bankAccount.account_number}`);
      console.log(`Account Balance: ₹${result1.data.bankAccount.balance.toLocaleString('en-IN')}`);
      console.log(`\nTotal Holdings: ${result1.data.summary.totalHoldings}`);
      console.log(`Total Value: ₹${result1.data.summary.totalValue.toFixed(2)}`);
      console.log(`Total Investment: ₹${result1.data.summary.totalInvestment.toFixed(2)}`);
      console.log(`Total Gain/Loss: ₹${result1.data.summary.totalGainLoss.toFixed(2)} (${result1.data.summary.totalGainLossPercent.toFixed(2)}%)`);
      
      if (result1.data.holdings.length > 0) {
        console.log('\n📊 Holdings Details:');
        result1.data.holdings.forEach((holding, index) => {
          console.log(`\n${index + 1}. ${holding.name} (${holding.symbol})`);
          console.log(`   Broker: ${holding.broker_name}`);
          console.log(`   Quantity: ${holding.quantity}`);
          console.log(`   Bought Price: ₹${holding.bought_price}`);
          console.log(`   Current Price: ₹${holding.current_price}`);
          console.log(`   Investment: ₹${holding.investment.toFixed(2)}`);
          console.log(`   Current Value: ₹${holding.currentValue.toFixed(2)}`);
          console.log(`   Gain/Loss: ₹${holding.gainLoss.toFixed(2)} (${holding.gainLossPercent.toFixed(2)}%)`);
          console.log(`   Status: ${holding.status}`);
        });
      }
      
      if (result1.data.dematAccounts.length > 0) {
        console.log('\n🏦 Demat Accounts:');
        result1.data.dematAccounts.forEach((demat, index) => {
          console.log(`${index + 1}. ${demat.broker_name} - ${demat.masked_demat || 'N/A'}`);
          console.log(`   Total Value: ₹${demat.total_value.toFixed(2)}`);
          console.log(`   Last Synced: ${demat.last_synced || 'Never'}`);
        });
      }
    } else {
      console.log('❌ FAILED:', result1.message);
    }
    
    // Test 2: Get all holdings for user (if user exists in auth_users)
    console.log(`\n\n2. Fetching all holdings for user: ${TEST_USER_ID} (may fail if user not in auth_users)`);
    const response2 = await fetch(`${API_BASE_URL}/holdings/user/${TEST_USER_ID}`);
    const result2 = await response2.json();
    
    console.log('Status:', response2.status);
    if (result2.success) {
      console.log('\n✅ SUCCESS: Holdings fetched via user_id');
    } else {
      console.log('ℹ️  INFO:', result2.message, '(This is expected if user is not in auth_users table)');
    }
    
    // Test 3: Get all holdings (admin endpoint)
    console.log('\n\n3. Fetching all holdings (admin)');
    const response3 = await fetch(`${API_BASE_URL}/holdings/all`);
    const result3 = await response3.json();
    
    console.log('Status:', response3.status);
    console.log(`Total holdings in database: ${result3.count || 0}`);
    
    if (result3.success && result3.data.length > 0) {
      console.log('\n✅ SUCCESS: All holdings fetched');
      console.log('Sample holdings:');
      result3.data.slice(0, 3).forEach((holding, index) => {
        console.log(`${index + 1}. ${holding.name} - Qty: ${holding.quantity}, Price: ₹${holding.current_price}`);
      });
    } else {
      console.log('❌ No holdings found or failed:', result3.message);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
  
  console.log('\n=== Test Complete ===\n');
}

// Run the test
testGetUserHoldings();
