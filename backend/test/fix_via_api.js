// Fix linked account via API
const axios = require('axios');

async function fixViaAPI() {
  try {
    console.log('🔧 Fixing linked account via admin API...\n');
    
    const response = await axios.post('http://localhost:3000/api/admin/fix-linked-account', {
      userId: '6b867f4e-6461-416e-8f6c-13ae8e177070',
      correctAccountNumber: '5893143322'
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

fixViaAPI();
