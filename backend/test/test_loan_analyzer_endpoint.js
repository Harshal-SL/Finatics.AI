/**
 * Test script to check if loan analyzer endpoint works
 * User ID: 6b867f4e-6461-416e-8f6c-13ae8e177070
 * Loan Amount: 100000
 */

const axios = require('axios');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const loanAmount = 100000;

console.log('='.repeat(70));
console.log('Testing Loan Analyzer Endpoint');
console.log('='.repeat(70));
console.log('User ID:', userId);
console.log('Loan Amount: ₹', loanAmount.toLocaleString('en-IN'));
console.log('Endpoint: POST /api/loan-analyzer');
console.log('='.repeat(70));
console.log('\n');

const requestPayload = {
  userId: userId,
  loanAmount: loanAmount
};

console.log('Request Payload:');
console.log(JSON.stringify(requestPayload, null, 2));
console.log('\n' + '='.repeat(70));
console.log('Sending request...');
console.log('='.repeat(70));
console.log('\n');

// Test the loan analyzer endpoint
axios.post('http://localhost:3000/api/loan-analyzer', requestPayload, {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ SUCCESS - Loan analysis completed!');
    console.log('Status Code:', response.status);
    console.log('\n' + '='.repeat(70));
    console.log('RESPONSE DATA:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(70));
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      console.log('\n📊 LOAN ANALYSIS SUMMARY:');
      console.log('='.repeat(70));
      console.log('Credit Score:', data.credit_score);
      console.log('Average Savings: ₹', data.average_savings.toLocaleString('en-IN'));
      console.log('Average Expenses: ₹', data.average_expenses.toLocaleString('en-IN'));
      console.log('Months Considered:', data.months_considered);
      console.log('\n' + '='.repeat(70));
      console.log('AI LOAN RECOMMENDATION:');
      console.log('='.repeat(70));
      console.log(data.ai_response);
      console.log('='.repeat(70));
    }
  })
  .catch(error => {
    console.log('❌ ERROR - Loan analysis failed');
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
    console.log('2. User has no linked bank accounts');
    console.log('3. Missing Gemini API key (will fallback to local analysis)');
    console.log('4. Database connection issues');
    console.log('='.repeat(70));
  });
