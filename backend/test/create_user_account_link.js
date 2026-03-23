/**
 * Link user to bank account in linkedbankaccounts table
 */
require('dotenv').config();
const { bankingDb, appDb } = require('../config/supabase');

const USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const ACCOUNT_NUMBER = '5893143322';

async function createUserAccountLink() {
  console.log('🔗 Creating user-to-account link...\n');
  console.log('User ID:', USER_ID);
  console.log('Account Number:', ACCOUNT_NUMBER);

  try {
    // 1. Get bank account details from banking DB
    console.log('\n1️⃣ Fetching bank account from banking DB...');
    const { data: bankAccount, error: bankError } = await bankingDb
      .from('bank_accounts')
      .select('*, customers(*)')
      .eq('account_number', ACCOUNT_NUMBER)
      .single();

    if (bankError || !bankAccount) {
      console.error('❌ Bank account not found:', bankError?.message);
      return;
    }

    console.log('✅ Bank Account found:');
    console.log(`   Account: ${bankAccount.account_number}`);
    console.log(`   Bank: ${bankAccount.bank_name}`);
    console.log(`   Type: ${bankAccount.account_type}`);
    console.log(`   Balance: ₹${bankAccount.balance}`);
    console.log(`   Customer: ${bankAccount.customers.full_name}`);

    // 2. Check if link already exists
    console.log('\n2️⃣ Checking for existing link...');
    const { data: existingLink, error: checkError } = await appDb
      .from('linkedbankaccounts')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('account_number', ACCOUNT_NUMBER)
      .maybeSingle();

    if (existingLink) {
      console.log('✅ Link already exists:');
      console.log(JSON.stringify(existingLink, null, 2));
      
      // Update if inactive
      if (existingLink.status !== 'active') {
        console.log('\n⚠️  Activating existing link...');
        const { error: updateError } = await appDb
          .from('linkedbankaccounts')
          .update({ 
            status: 'active',
            last_sync: new Date().toISOString()
          })
          .eq('link_id', existingLink.link_id);

        if (updateError) {
          console.error('❌ Error activating link:', updateError.message);
        } else {
          console.log('✅ Link activated successfully');
        }
      }
    } else {
      console.log('⚠️  No existing link found, creating new link...');
      
      const linkData = {
        user_id: USER_ID,
        account_number: bankAccount.account_number
      };

      console.log('\n📝 Link data:', JSON.stringify(linkData, null, 2));

      const { data: newLink, error: insertError } = await appDb
        .from('linkedbankaccounts')
        .insert([linkData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating link:', insertError.message);
        console.error('Details:', insertError);
      } else {
        console.log('✅ Link created successfully!');
        console.log(JSON.stringify(newLink, null, 2));
      }
    }

    // 3. Verify the complete chain
    console.log('\n3️⃣ Verifying complete chain...');
    console.log(`   User → Account: ${ACCOUNT_NUMBER}`);
    console.log(`   Account → Customer: ${bankAccount.customers.full_name} (ID: ${bankAccount.customers.customer_id})`);
    
    // Get demat accounts
    const { data: dematAccounts, error: dematError } = await bankingDb
      .from('demat_accounts')
      .select('*')
      .eq('customer_id', bankAccount.customers.customer_id);

    if (dematAccounts && dematAccounts.length > 0) {
      console.log(`   Customer → Demat: ${dematAccounts.length} account(s)`);
      
      for (const demat of dematAccounts) {
        const { data: holdings } = await bankingDb
          .from('holdings')
          .select('holding_id')
          .eq('demat_id', demat.demat_id);
        
        console.log(`     - ${demat.broker_name}: ${holdings?.length || 0} holdings`);
      }
    } else {
      console.log('   ⚠️  No demat accounts found');
    }

    console.log('\n✨ Link creation complete!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ User ${USER_ID} linked to account ${ACCOUNT_NUMBER}`);
    console.log(`   ✅ Account belongs to ${bankAccount.customers.full_name}`);
    console.log(`   ✅ Ready to fetch holdings via /api/holdings/user/${USER_ID}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

createUserAccountLink();
