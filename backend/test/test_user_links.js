require('dotenv').config();
const { appDb, bankingDb } = require('../config/supabase');

(async () => {
  const userId = process.argv[2] || '6b867f4e-6461-416e-8f6c-13ae8e177070';
  console.log('Checking linked accounts for user:', userId);

  // Check linkedbankaccounts
  const { data: links, error: linkErr } = await appDb
    .from('linkedbankaccounts')
    .select('*')
    .eq('user_id', userId);

  if (linkErr) {
    console.error('Error fetching linkedbankaccounts:', linkErr);
    process.exit(1);
  }

  console.log('linkedbankaccounts records:', links);

  if (links && links.length > 0) {
    const accountNumbers = links.map(l => l.account_number).filter(Boolean);
    console.log('Account numbers found:', accountNumbers);

    if (accountNumbers.length > 0) {
      const { data: bankAccs, error: bankErr } = await bankingDb
        .from('bank_accounts')
        .select('account_id, account_number, customer_id, balance')
        .in('account_number', accountNumbers);
      if (bankErr) {
        console.error('Error fetching bank_accounts:', bankErr);
      } else {
        console.log('bank_accounts matched:', bankAccs);
        
        if (bankAccs && bankAccs.length > 0) {
          const customerIds = [...new Set(bankAccs.map(a => a.customer_id))];
          console.log('Customer IDs:', customerIds);
          
          const { data: customers, error: custErr } = await bankingDb
            .from('customers')
            .select('customer_id, credit_score, full_name')
            .in('customer_id', customerIds);
          
          if (custErr) {
            console.error('Error fetching customers:', custErr);
          } else {
            console.log('Customers:', customers);
          }
        }
      }
    }
  } else {
    console.log('No linked accounts found for this user.');
  }
})();
