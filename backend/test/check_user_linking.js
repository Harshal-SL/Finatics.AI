/**
 * Check user linking between auth_users and customers
 */
require('dotenv').config();
const { bankingDb, appDb } = require('../config/supabase');

const USER_ID = 'f2ef5448-7749-4cd5-8aeb-17221ecd0eae';

async function checkUserLinking() {
  console.log('🔍 Checking user linking...\n');

  try {
    // 1. Get auth user
    console.log('1️⃣ Fetching auth user...');
    const { data: authUser, error: authError } = await appDb
      .from('auth_users')
      .select('*')
      .eq('id', USER_ID)
      .single();

    if (authError) {
      console.error('❌ Auth user not found:', authError.message);
      return;
    }

    console.log('✅ Auth User found:');
    console.log(JSON.stringify(authUser, null, 2));

    // 2. Search for customer by email
    console.log('\n2️⃣ Searching for customer by email:', authUser.email);
    const { data: customers, error: customerError } = await bankingDb
      .from('customers')
      .select('*')
      .eq('email', authUser.email);

    if (customerError) {
      console.error('❌ Error searching customers:', customerError.message);
      return;
    }

    if (customers && customers.length > 0) {
      console.log('✅ Customer found:');
      console.log(JSON.stringify(customers[0], null, 2));

      // 3. Get demat accounts
      console.log('\n3️⃣ Fetching demat accounts...');
      const { data: dematAccounts, error: dematError } = await bankingDb
        .from('demat_accounts')
        .select('*')
        .eq('customer_id', customers[0].customer_id);

      if (dematAccounts && dematAccounts.length > 0) {
        console.log('✅ Demat accounts found:', dematAccounts.length);
        console.log(JSON.stringify(dematAccounts, null, 2));
      } else {
        console.log('⚠️  No demat accounts found');
      }
    } else {
      console.log('❌ No customer found with email:', authUser.email);
      console.log('\n📋 Available customers (first 5):');
      const { data: allCustomers } = await bankingDb
        .from('customers')
        .select('customer_id, full_name, email')
        .limit(5);
      console.log(JSON.stringify(allCustomers, null, 2));

      console.log('\n💡 Solution: Link this auth user to an existing customer');
      console.log('   Option 1: Update customer email to match:', authUser.email);
      console.log('   Option 2: Create a new customer record with this email');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserLinking();
