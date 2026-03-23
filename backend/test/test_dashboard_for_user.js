/**
 * Test script to check if dashboard endpoint retrieves data for specific user
 * User ID: 6b867f4e-6461-416e-8f6c-13ae8e177070
 * Account Number: 5893143322
 */

const axios = require('axios');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const accountNumber = '5893143322';

console.log('='.repeat(70));
console.log('Testing Dashboard Endpoint for User');
console.log('='.repeat(70));
console.log('User ID:', userId);
console.log('Account Number:', accountNumber);
console.log('Endpoint: GET /api/dashboard?userId=' + userId);
console.log('='.repeat(70));
console.log('\n');

// Test the dashboard endpoint
axios.get(`http://localhost:3000/api/dashboard?userId=${userId}`)
  .then(response => {
    console.log('✅ SUCCESS - Dashboard data retrieved!');
    console.log('Status Code:', response.status);
    console.log('\n' + '='.repeat(70));
    console.log('RESPONSE DATA:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(70));
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      console.log('\nDASHBOARD SUMMARY:');
      console.log('='.repeat(70));
      console.log('Account Balance:', data.account_balance);
      console.log('Monthly Expenses:', data.monthly_expenses);
      console.log('Monthly Savings:', data.monthly_savings);
      console.log('Linked Accounts Count:', data.linked_accounts_count);
      console.log('Recent Transactions Count:', data.recent_transactions?.length || 0);
      
      if (data.bank_accounts && data.bank_accounts.length > 0) {
        console.log('\n📊 Bank Accounts:');
        data.bank_accounts.forEach((account, idx) => {
          console.log(`  ${idx + 1}. Account #${account.account_number}`);
          console.log(`     Bank: ${account.bank_name}`);
          console.log(`     Balance: ₹${account.balance}`);
          console.log(`     Type: ${account.account_type}`);
        });
      }
      
      if (data.recent_transactions && data.recent_transactions.length > 0) {
        console.log('\n💳 Recent Transactions:');
        data.recent_transactions.forEach((txn, idx) => {
          console.log(`  ${idx + 1}. ${txn.description || txn.txn_type}`);
          console.log(`     Amount: ₹${txn.amount} | Date: ${txn.txn_date}`);
        });
      }
      
      console.log('='.repeat(70));
    }
  })
  .catch(error => {
    console.log('❌ ERROR - Dashboard data retrieval failed');
    console.log('Status Code:', error.response?.status || 'N/A');
    console.log('\n' + '='.repeat(70));
    console.log('ERROR DETAILS:');
    console.log('='.repeat(70));
    
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.message) {
      console.log('Error Message:', error.message);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('POSSIBLE CAUSES:');
    console.log('='.repeat(70));
    console.log('1. Backend server is not running (http://localhost:3000)');
    console.log('2. User has no linked bank accounts in Application DB');
    console.log('3. Account number mismatch between Application DB and Banking DB');
    console.log('4. Missing Supabase environment variables');
    console.log('5. Database connection issues');
    console.log('='.repeat(70));
  });
