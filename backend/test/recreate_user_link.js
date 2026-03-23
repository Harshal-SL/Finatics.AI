require('dotenv').config();
const { appDb } = require('../config/supabase');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  const uuidToMap = '508b0b26-755a-42f3-a5b0-d94f8d3130e1'; // This UUID maps to account_id=1
  
  console.log('Creating linkedbankaccounts entry...');
  console.log('User ID:', userId);
  console.log('Account UUID (maps to banking account_id=1):', uuidToMap);
  
  const { data, error } = await appDb
    .from('linkedbankaccounts')
    .insert({
      user_id: userId,
      account_number: uuidToMap,
      bank_name: 'ICICI Bank',
      account_type: 'Savings',
      ifsc_code: 'IFSC3289'
    })
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('\n✓ Success! Link created:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nThis UUID is hardcoded in loanAnalyzerService to map to banking account_id=1');
  }
})();
