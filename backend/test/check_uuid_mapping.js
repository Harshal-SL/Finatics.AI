require('dotenv').config();
const { bankingDb } = require('../config/supabase');

(async () => {
  const uuid = '508b0b26-755a-42f3-a5b0-d94f8d3130e1';
  
  console.log('Trying to find account by UUID as account_id...');
  const { data, error } = await bankingDb
    .from('bank_accounts')
    .select('*')
    .eq('account_id', uuid);
  
  console.log('Result:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
  
  if (!data || data.length === 0) {
    console.log('\nNo match found. Trying as integer account_id...');
    // Maybe it's stored as integer, let's check all accounts
    const { data: all } = await bankingDb
      .from('bank_accounts')
      .select('account_id, account_number, customer_id, balance')
      .limit(10);
    console.log('Sample accounts:', JSON.stringify(all, null, 2));
  }
})();
