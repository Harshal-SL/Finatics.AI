require('dotenv').config();
const { bankingDb } = require('../config/supabase');

(async () => {
  const { data, error } = await bankingDb
    .from('bank_accounts')
    .select('account_id, account_number, customer_id, balance')
    .limit(5);
  
  console.log('Sample bank_accounts:');
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
})();
