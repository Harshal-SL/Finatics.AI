// Fix the linked account to use the correct account number from banking database
const { appDb } = require('../config/supabase');

async function fixLinkedAccount() {
  try {
    console.log('🔧 Fixing linked bank account...\n');
    
    const TEST_USER_ID = '6b867f4e-6461-416e-8f6c-13ae8e177070';
    const CORRECT_ACCOUNT_NUMBER = '5893143322'; // The actual account number in banking DB
    
    // Update the linked account
    const { data, error } = await appDb
      .from('linkedbankaccounts')
      .update({
        account_number: CORRECT_ACCOUNT_NUMBER
      })
      .eq('user_id', TEST_USER_ID)
      .select();

    if (error) {
      console.error('❌ Error updating linked account:', error);
      return;
    }

    console.log('✅ Successfully updated linked account:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n🎉 Done! Now the investment API should work correctly.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixLinkedAccount();
