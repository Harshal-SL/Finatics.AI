require('dotenv').config();
const { appDb, bankingDb } = require('../config/supabase');
const crypto = require('crypto');

(async () => {
  const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
  const existingUuid = '508b0b26-755a-42f3-a5b0-d94f8d3130e1';
  
  console.log('Strategy: Create/update a banking account with the UUID as account_number');
  console.log('Existing UUID from linkedbankaccounts:', existingUuid);
  
  // Check if this UUID exists as account_number in banking DB
  const { data: existing } = await bankingDb
    .from('bank_accounts')
    .select('*')
    .eq('account_number', existingUuid);
  
  if (existing && existing.length > 0) {
    console.log('Account already exists!', existing);
  } else {
    console.log('No match found. Will create a new banking account with this UUID...');
    
    // Insert a new bank account with the UUID
    const { data: newAcc, error: insertErr } = await bankingDb
      .from('bank_accounts')
      .insert({
        account_number: existingUuid,
        customer_id: 1, // Use existing customer
        bank_name: 'HDFC Bank',
        account_holder: 'Test User',
        account_type: 'savings',
        balance: 50000,
        currency: 'INR',
        status: 'active'
      })
      .select();
    
    if (insertErr) {
      console.error('Insert error:', insertErr);
    } else {
      console.log('Success! Banking account created:', JSON.stringify(newAcc, null, 2));
    }
  }
})();
