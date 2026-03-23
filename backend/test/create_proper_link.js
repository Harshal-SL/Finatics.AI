require('dotenv').config();
const { appDb, bankingDb } = require('../config/supabase');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  
  // First, get a real banking account
  console.log('Finding a banking account to link...');
  const { data: bankAcc } = await bankingDb
    .from('bank_accounts')
    .select('account_id, account_number, customer_id, balance')
    .eq('account_id', 1)
    .single();
  
  console.log('Banking account found:', bankAcc);
  
  // Delete old incorrect link
  console.log('\nDeleting old link...');
  const { error: delError } = await appDb
    .from('linkedbankaccounts')
    .delete()
    .eq('user_id', userId);
  
  if (delError) console.error('Delete error:', delError);
  
  // Create new link with proper account_number
  console.log('\nCreating new link with banking account_number...');
  const { data: newLink, error: insertError } = await appDb
    .from('linkedbankaccounts')
    .insert({
      user_id: userId,
      account_number: bankAcc.account_number, // Use the numeric account number
      bank_name: 'HDFC Bank',
      account_type: 'savings',
      ifsc_code: 'HDFC0001234'
    })
    .select();
  
  if (insertError) {
    console.error('Insert error:', insertError);
  } else {
    console.log('Success! New link created:', JSON.stringify(newLink, null, 2));
  }
})();
  