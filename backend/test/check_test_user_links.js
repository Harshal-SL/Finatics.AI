require('dotenv').config();
const { appDb } = require('../config/supabase');

(async () => {
  const testUserId = '2b06a9d7-a452-45a4-a31e-38e7c411c7ab'; // From test files
  
  console.log('Checking linkedbankaccounts for test user...');
  const { data, error } = await appDb
    .from('linkedbankaccounts')
    .select('*')
    .eq('user_id', testUserId);
  
  console.log('Result:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
})();
