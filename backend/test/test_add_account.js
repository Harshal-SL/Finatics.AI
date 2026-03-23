/**
 * Test script for the /api/add-account endpoint
 * This script tests if the add bank account functionality works correctly
 */

const testAddAccount = async () => {
  try {
    const testData = {
      userid: '12345678-1234-1234-1234-123456789012', // Sample UUID
      bank_name: 'HDFC Bank',
      ifsc_code: 'HDFC0001234',
      account_type: 'savings'
    };

    console.log('Testing /api/add-account endpoint...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:3000/api/add-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed! Bank account added successfully.');
    } else {
      console.log('❌ Test failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Run the test
testAddAccount();