require('dotenv').config();
const { appDb } = require('../config/supabase');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  
  // Try to get ALL columns from linkedbankaccounts
  const { data, error } = await appDb
    .from('linkedbankaccounts')
    .select('*')
    .eq('user_id', userId);
  
  console.log('All columns in linkedbankaccounts for user:');
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
  
  if (data && data.length > 0) {
    console.log('\nColumn names:', Object.keys(data[0]));
  }
})();
