/**
 * Test Script - Create a proper account linkage for testing dashboard endpoint
 * Links a real user to a real bank account from Banking DB
 */

require('dotenv').config();
const { appDb, bankingDb } = require('../config/supabase');

async function createTestAccountLink() {
  try {
    console.log('Creating test account link...');
    
    // Test user and real bank account from Banking DB
    const testUserId = '5de1d2f2-2d00-41f2-9149-1ac67849cb08'; // Manu JP
    const realAccountNumber = '5893143322'; // Real account from Banking DB
    
    // First verify the account exists in Banking DB
    const { data: bankAccount, error: bankError } = await bankingDb
      .from('bank_accounts')
      .select('*')
      .eq('account_number', realAccountNumber)
      .single();
    
    if (bankError) {
      console.error('Bank account not found:', bankError.message);
      return;
    }
    
    console.log('Found bank account:', bankAccount);
    
    // Check if link already exists
    const { data: existingLink } = await appDb
      .from('linkedbankaccounts')
      .select('*')
      .eq('user_id', testUserId)
      .eq('account_number', realAccountNumber);
    
    if (existingLink && existingLink.length > 0) {
      console.log('Link already exists:', existingLink[0]);
      return;
    }
    
    // Create the link with account_number as text (not UUID)
    const { data: newLink, error: linkError } = await appDb
      .from('linkedbankaccounts')
      .insert({
        user_id: testUserId,
        account_number: realAccountNumber, // Store as text, not UUID
        bank_name: bankAccount.bank_name,
        ifsc_code: bankAccount.ifsc_code,
        account_type: bankAccount.account_type.toLowerCase(),
        linked_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (linkError) {
      console.error('Failed to create link:', linkError.message);
      return;
    }
    
    console.log('Successfully created account link:', newLink);
    console.log('\nNow you can test the dashboard endpoint with:');
    console.log(`GET /api/dashboard?userId=${testUserId}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestAccountLink();