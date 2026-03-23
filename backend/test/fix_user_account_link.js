require('dotenv').config();
const { appDb } = require('../config/supabase');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  const realAccountNumber = '5893143322'; // From banking DB account_id 1
  
  console.log('Updating linkedbankaccounts to use real banking account number...');
  
  const { data, error } = await appDb
    .from('linkedbankaccounts')
    .update({ account_number: realAccountNumber })
    .eq('user_id', userId)
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Updated records:', JSON.stringify(data, null, 2));
  }
})();
