// Fix existing linked accounts by creating corresponding banking database entries
const { appDb, bankingDb } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function fixExistingAccounts() {
  try {
    console.log('🔧 Fixing existing linked accounts...\n');
    
    // Get all linked accounts
    const { data: linkedAccounts, error: linkedError } = await appDb
      .from('linkedbankaccounts')
      .select('*');

    if (linkedError) {
      console.error('❌ Error fetching linked accounts:', linkedError);
      return;
    }

    console.log(`📋 Found ${linkedAccounts.length} linked accounts\n`);

    for (const linkedAccount of linkedAccounts) {
      console.log(`Processing account: ${linkedAccount.account_number}`);
      
      // Check if this account exists in banking database
      const { data: existingBankAccount } = await bankingDb
        .from('bank_accounts')
        .select('*')
        .eq('account_number', linkedAccount.account_number)
        .single();

      if (existingBankAccount) {
        console.log(`  ✅ Account already exists in banking database`);
        continue;
      }

      console.log(`  Creating missing banking database entries...`);

      // Get user details
      const { data: userData } = await appDb
        .from('users')
        .select('full_name, email')
        .eq('user_id', linkedAccount.user_id)
        .single();

      // Generate IDs
      const customerId = uuidv4();
      const accountId = uuidv4();

      // Create customer
      const { error: customerError } = await bankingDb
        .from('customers')
        .insert([{
          customer_id: customerId,
          name: userData?.full_name || 'User',
          email: userData?.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          created_at: new Date().toISOString()
        }]);

      if (customerError) {
        console.error(`  ❌ Error creating customer:`, customerError.message);
        continue;
      }

      // Create bank account
      const { error: accountError } = await bankingDb
        .from('bank_accounts')
        .insert([{
          account_id: accountId,
          account_number: linkedAccount.account_number,
          customer_id: customerId,
          account_type: linkedAccount.account_type || 'savings',
          balance: 0,
          currency: 'INR',
          status: 'active',
          branch: linkedAccount.bank_name,
          ifsc_code: linkedAccount.ifsc_code,
          created_at: new Date().toISOString()
        }]);

      if (accountError) {
        console.error(`  ❌ Error creating bank account:`, accountError.message);
        continue;
      }

      console.log(`  ✅ Successfully created customer and bank account in banking database`);
      console.log(`     Customer ID: ${customerId}`);
      console.log(`     Account ID: ${accountId}`);
    }

    console.log(`\n✅ Migration complete!`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

fixExistingAccounts();
