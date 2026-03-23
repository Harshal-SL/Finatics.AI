/**
 * Link authenticated user to existing banking customer
 * This creates the auth_users record with the same email as the banking customer
 */
require('dotenv').config();
const { bankingDb, appDb } = require('../config/supabase');

const USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const ACCOUNT_NUMBER = '5893143322';

async function linkUserToCustomer() {
  console.log('🔗 Testing user-to-customer linking...\n');
  console.log('User ID:', USER_ID);
  console.log('Account Number:', ACCOUNT_NUMBER);

  try {
    // 1. Get bank account and customer from banking DB
    console.log('\n1️⃣ Fetching bank account from banking DB...');
    const { data: bankAccount, error: accountError } = await bankingDb
      .from('bank_accounts')
      .select('*, customers(*)')
      .eq('account_number', ACCOUNT_NUMBER)
      .single();

    if (accountError || !bankAccount) {
      console.error('❌ Account not found:', accountError?.message);
      return;
    }

    console.log('✅ Bank Account found:');
    console.log(`   Account: ${bankAccount.account_number}`);
    console.log(`   Bank: ${bankAccount.bank_name}`);
    console.log(`   Balance: ₹${bankAccount.balance}`);
    console.log(`   Customer: ${bankAccount.customers.full_name}`);
    console.log(`   Email: ${bankAccount.customers.email}`);
    console.log(`   Customer ID: ${bankAccount.customers.customer_id}`);

    const customer = bankAccount.customers;

    // 2. Try to get user from Supabase Auth
    console.log('\n2️⃣ Checking Supabase Auth for user...');
    const { data: { user: authUser }, error: authError } = await appDb.auth.admin.getUserById(USER_ID);

    if (authError || !authUser) {
      console.error('❌ User not found in Supabase Auth:', authError?.message);
      console.log('\n💡 The user needs to be created in Supabase Auth first.');
      console.log('   This should happen during signup.');
      return;
    }

    console.log('✅ User found in Supabase Auth:');
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}`);
    console.log(`   Created: ${authUser.created_at}`);

    // 3. Check if emails match
    console.log('\n3️⃣ Verifying email match...');
    if (authUser.email.toLowerCase() === customer.email.toLowerCase()) {
      console.log('✅ Emails match! User can access this customer\'s data.');
    } else {
      console.log('⚠️  Email mismatch:');
      console.log(`   Auth email: ${authUser.email}`);
      console.log(`   Customer email: ${customer.email}`);
      console.log('\n💡 Update customer email to match auth user, or vice versa.');
      
      // Offer to update customer email
      console.log('\n🔧 To fix: Update customer email in banking DB to:', authUser.email);
    }

    // 4. Test the holdings endpoint
    console.log('\n4️⃣ Testing holdings endpoint...');
    const { data: dematAccounts, error: dematError } = await bankingDb
      .from('demat_accounts')
      .select('*, holdings(*)')
      .eq('customer_id', customer.customer_id);

    if (dematError) {
      console.error('❌ Error fetching demat accounts:', dematError.message);
    } else if (dematAccounts && dematAccounts.length > 0) {
      console.log('✅ Found', dematAccounts.length, 'demat account(s)');
      dematAccounts.forEach((demat, i) => {
        console.log(`\n   Demat ${i + 1}: ${demat.broker_name}`);
        console.log(`   Holdings: ${demat.holdings?.length || 0}`);
        if (demat.holdings && demat.holdings.length > 0) {
          demat.holdings.forEach((h, j) => {
            console.log(`     ${j + 1}. ${h.name} - Qty: ${h.quantity}, Price: ₹${h.current_price}`);
          });
        }
      });
    } else {
      console.log('⚠️  No demat accounts found for this customer');
    }

    console.log('\n✨ Test complete!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ User exists in Supabase Auth: ${authUser.email}`);
    console.log(`   ✅ Customer exists in Banking DB: ${customer.full_name}`);
    console.log(`   ${authUser.email === customer.email ? '✅' : '⚠️ '} Email match: ${authUser.email === customer.email}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

linkUserToCustomer();
