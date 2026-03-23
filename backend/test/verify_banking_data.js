require('dotenv').config();
const { bankingDb } = require('../config/supabase');

(async () => {
  const accountId = 1;
  
  console.log('Checking banking account', accountId);
  
  const { data: acc } = await bankingDb
    .from('bank_accounts')
    .select('*')
    .eq('account_id', accountId)
    .single();
  
  console.log('Account:', acc);
  
  console.log('\nChecking customer...');
  const { data: cust } = await bankingDb
    .from('customers')
    .select('*')
    .eq('customer_id', acc.customer_id)
    .single();
  
  console.log('Customer:', cust);
  
  console.log('\nChecking transactions...');
  const { data: txns, count } = await bankingDb
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('account_id', accountId)
    .limit(5);
  
  console.log(`Total transactions: ${count}`);
  console.log('Sample transactions:', JSON.stringify(txns, null, 2));
})();
