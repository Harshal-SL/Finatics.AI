require('dotenv').config();
const { appDb } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  const bankingAccountId = 1; // We'll encode this in a custom format
  
  console.log('Deleting old incorrect link...');
  await appDb
    .from('linkedbankaccounts')
    .delete()
    .eq('user_id', userId);
  
  // Generate a new UUID to represent banking account_id = 1
  const newUuid = uuidv4();
  console.log('\nCreating new link with UUID:', newUuid);
  console.log('This UUID will map to banking account_id:', bankingAccountId);
  
  const { data, error } = await appDb
    .from('linkedbankaccounts')
    .insert({
      user_id: userId,
      account_number: newUuid,
      bank_name: 'HDFC Bank',
      account_type: 'savings',
      ifsc_code: 'HDFC0001234',
      // Store the actual banking account_id in a comment or metadata if needed
    })
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', JSON.stringify(data, null, 2));
    console.log('\nNOTE: You need to manually create a mapping from this UUID to account_id=1');
    console.log('OR update the loanAnalyzerService to use a mapping table/strategy.');
  }
})();
