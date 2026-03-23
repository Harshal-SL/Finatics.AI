/**
 * Test script to simulate the exact add-account API request
 */

const axios = require('axios');

const testData = {
  userid: 'ab66b8e4-e6c9-433b-9716-61c786f5e2c8',
  bank_name: 'Axis Bank',
  ifsc_code: 'IFSC9462',
  account_type: 'salary'
};

console.log('Testing add-account endpoint...');
console.log('Request payload:', JSON.stringify(testData, null, 2));
console.log('\n');

axios.post('http://localhost:3000/api/add-account', testData, {
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': testData.userid
  }
})
.then(response => {
  console.log('✅ SUCCESS:', response.status);
  console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.log('❌ ERROR:', error.response?.status || error.message);
  if (error.response?.data) {
    console.log('Error details:', JSON.stringify(error.response.data, null, 2));
  }
  if (error.response?.headers) {
    console.log('\nResponse headers:', error.response.headers);
  }
});
