// Debug script to check investment data flow
const axios = require('axios');

const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const API_URL = 'http://localhost:3000';

async function debugInvestments() {
  console.log('🔍 Debugging Investment Data Flow\n');
  
  try {
    // 1. Check linked accounts
    console.log('1️⃣ Checking Linked Bank Accounts...');
    const linkedResponse = await axios.get(`${API_URL}/api/bank-accounts/${TEST_USER_ID}`);
    console.log('Linked Accounts:', JSON.stringify(linkedResponse.data, null, 2));
    
    if (linkedResponse.data.data && linkedResponse.data.data.length > 0) {
      const accountNumber = linkedResponse.data.data[0].account_number;
      console.log(`\n📝 Found account_number: ${accountNumber}`);
      
      // 2. Check investments
      console.log('\n2️⃣ Checking Investments...');
      const investmentResponse = await axios.get(`${API_URL}/api/investments?userId=${TEST_USER_ID}`);
      console.log('Investment Data:', JSON.stringify(investmentResponse.data, null, 2));
      
      // 3. Try the by-account endpoint
      console.log(`\n3️⃣ Trying /by-account endpoint with account_number: ${accountNumber}...`);
      const byAccountResponse = await axios.get(`${API_URL}/api/investments/by-account?accountNumber=${accountNumber}`);
      console.log('By-Account Data:', JSON.stringify(byAccountResponse.data, null, 2));
    } else {
      console.log('❌ No linked accounts found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugInvestments();
