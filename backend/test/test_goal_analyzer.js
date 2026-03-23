/**
 * Test script for Goal Analyzer endpoint
 * Tests the /api/goals endpoint with sample data
 */

const axios = require('axios');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const targetAmount = 5000000; // 50 lakhs
const targetDate = '2030-12-31';
const riskTolerance = 'Medium';

console.log('='.repeat(80));
console.log('TESTING GOAL ANALYZER ENDPOINT');
console.log('='.repeat(80));
console.log('User ID:', userId);
console.log('Target Amount: ₹', targetAmount.toLocaleString('en-IN'));
console.log('Target Date:', targetDate);
console.log('Risk Tolerance:', riskTolerance);
console.log('Endpoint: POST /api/goals');
console.log('='.repeat(80));
console.log('\n');

const requestPayload = {
  userId,
  targetAmount,
  targetDate,
  riskTolerance
};

console.log('Request Payload:');
console.log(JSON.stringify(requestPayload, null, 2));
console.log('\n' + '='.repeat(80));
console.log('Sending request...');
console.log('='.repeat(80));
console.log('\n');

axios.post('http://localhost:3000/api/goals', requestPayload, {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ SUCCESS - Goal analysis completed!');
    console.log('Status Code:', response.status);
    console.log('\n' + '='.repeat(80));
    console.log('FULL JSON RESPONSE:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(80));
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      
      console.log('\n📊 USER FINANCIAL METRICS:');
      console.log('='.repeat(80));
      console.log('Monthly Income: ₹', data.userMetrics?.monthlyIncome?.toLocaleString('en-IN'));
      console.log('Monthly Expenses: ₹', data.userMetrics?.monthlyExpenses?.toLocaleString('en-IN'));
      console.log('Monthly Savings: ₹', data.userMetrics?.monthlySavings?.toLocaleString('en-IN'));
      console.log('Credit Score:', data.userMetrics?.creditScore);
      
      if (data.goalAnalysis) {
        console.log('\n🎯 GOAL ANALYSIS:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(data.goalAnalysis.goalAnalysis, null, 2));
        
        console.log('\n📈 PATH ASSESSMENT:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(data.goalAnalysis.pathAssessment, null, 2));
        
        console.log('\n💡 ACTION PLAN:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(data.goalAnalysis.actionPlan, null, 2));
        
        console.log('\n📊 INVESTMENT STRATEGY:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(data.goalAnalysis.investmentStrategy, null, 2));
        
        console.log('\n⚠️  DISCLAIMER:');
        console.log('='.repeat(80));
        console.log(data.goalAnalysis.disclaimer);
      }
      console.log('='.repeat(80));
    }
  })
  .catch(error => {
    console.log('❌ ERROR - Goal analysis failed');
    console.log('Status Code:', error.response?.status || 'N/A');
    console.log('\n' + '='.repeat(80));
    console.log('ERROR DETAILS:');
    console.log('='.repeat(80));
    
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.message) {
      console.log('Error Message:', error.message);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('POSSIBLE CAUSES:');
    console.log('='.repeat(80));
    console.log('1. Backend server is not running (http://localhost:3000)');
    console.log('2. User has no financial data');
    console.log('3. Invalid request parameters');
    console.log('4. Database connection issues');
    console.log('='.repeat(80));
  });
