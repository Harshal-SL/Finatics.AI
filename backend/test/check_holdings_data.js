/**
 * Quick check for user and customer data
 */

require('dotenv').config();
const { bankingDb, appDb } = require('../config/supabase');

const USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const ACCOUNT_NUMBER = '5893143322';

async function checkData() {
  console.log('\n=== Checking Data ===\n');

  try {
    // Check auth_users
    console.log('1. Checking auth_users table...');
    const { data: authUsers, error: authError } = await appDb
      .from('auth_users')
      .select('*')
      .limit(5);
    
    console.log('Auth users sample:', authUsers?.length || 0, 'users found');
    if (authUsers && authUsers.length > 0) {
      console.log('Sample:', authUsers[0]);
    }

    // Check for specific user
    const { data: specificUser, error: specificError } = await appDb
      .from('auth_users')
      .select('*')
      .eq('id', USER_ID);
    
    console.log(`\nSpecific user ${USER_ID}:`, specificUser);
    
    // Check bank accounts for the account number
    console.log('\n2. Checking bank_accounts table for account number...');
    const { data: bankAccount, error: bankError } = await bankingDb
      .from('bank_accounts')
      .select('*')
      .eq('account_number', ACCOUNT_NUMBER)
      .single();
    
    if (bankAccount) {
      console.log('✅ Found bank account:', bankAccount);
      
      // Get customer for this account
      console.log('\n3. Getting customer for this account...');
      const { data: customer, error: custError } = await bankingDb
        .from('customers')
        .select('*')
        .eq('customer_id', bankAccount.customer_id)
        .single();
      
      if (customer) {
        console.log('✅ Found customer:', customer);
        
        // Get demat accounts for customer
        console.log('\n4. Getting demat accounts for customer...');
        const { data: dematAccounts, error: dematError } = await bankingDb
          .from('demat_accounts')
          .select('*')
          .eq('customer_id', customer.customer_id);
        
        console.log(`Found ${dematAccounts?.length || 0} demat accounts`);
        if (dematAccounts && dematAccounts.length > 0) {
          console.log('Demat accounts:', dematAccounts);
          
          // Get holdings for demat accounts
          console.log('\n5. Getting holdings...');
          const dematIds = dematAccounts.map(d => d.demat_id);
          const { data: holdings, error: holdingsError } = await bankingDb
            .from('holdings')
            .select('*')
            .in('demat_id', dematIds);
          
          console.log(`Found ${holdings?.length || 0} holdings`);
          if (holdings && holdings.length > 0) {
            console.log('✅ Holdings found!');
            holdings.forEach(h => {
              console.log(`- ${h.name}: ${h.quantity} @ ₹${h.current_price}`);
            });
          }
        }
      }
    } else {
      console.log('❌ Bank account not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n=== Check Complete ===\n');
}

checkData();
