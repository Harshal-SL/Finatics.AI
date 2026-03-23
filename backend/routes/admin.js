const express = require('express');
const router = express.Router();
const { appDb, bankingDb } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/admin/fix-linked-account
 * @desc    Fix a user's linked account to use correct account number
 * @access  Admin only
 */
router.post('/fix-linked-account', async (req, res) => {
  try {
    const { userId, correctAccountNumber } = req.body;
    
    console.log(`Fixing linked account for user ${userId} to use account ${correctAccountNumber}`);

    // Update the linked account
    const { data, error } = await appDb
      .from('linkedbankaccounts')
      .update({ account_number: correctAccountNumber })
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Linked account updated successfully',
      data
    });

  } catch (error) {
    console.error('Error fixing linked account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/fix-accounts
 * @desc    Fix existing linked accounts by creating corresponding banking database entries
 * @access  Admin only (should be protected in production)
 */
router.post('/fix-accounts', async (req, res) => {
  try {
    console.log('🔧 Starting account fix process...');
    
    // Get all linked accounts
    const { data: linkedAccounts, error: linkedError } = await appDb
      .from('linkedbankaccounts')
      .select('*');

    if (linkedError) {
      throw new Error(`Error fetching linked accounts: ${linkedError.message}`);
    }

    const results = [];

    for (const linkedAccount of linkedAccounts) {
      const result = {
        account_number: linkedAccount.account_number,
        status: 'processing'
      };

      // Check if this account exists in banking database
      const { data: existingBankAccount } = await bankingDb
        .from('bank_accounts')
        .select('*')
        .eq('account_number', linkedAccount.account_number)
        .single();

      if (existingBankAccount) {
        result.status = 'already_exists';
        result.message = 'Account already exists in banking database';
        results.push(result);
        continue;
      }

      // Get user details
      const { data: userData } = await appDb
        .from('users')
        .select('full_name, email')
        .eq('user_id', linkedAccount.user_id)
        .single();

      // Generate IDs (integers for banking database) with randomization
      const customerId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      const accountId = customerId + Math.floor(Math.random() * 1000);
      
      // Generate a 16-digit account number (fits in varchar(30))
      const newAccountNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
      
      // Update the linked account with the new account number
      await appDb
        .from('linkedbankaccounts')
        .update({ account_number: newAccountNumber })
        .eq('account_number', linkedAccount.account_number);

      // Create customer
      const { error: customerError } = await bankingDb
        .from('customers')
        .insert([{
          customer_id: customerId,
          full_name: userData?.full_name || 'User',
          email: userData?.email || '',
          phone: '',
          address: '',
          dob: null,
          aadhar_number: '',
          pan_number: '',
          credit_score: 0
        }]);

      if (customerError) {
        result.status = 'error';
        result.message = `Error creating customer: ${customerError.message}`;
        results.push(result);
        continue;
      }

      // Create bank account
      const { error: accountError } = await bankingDb
        .from('bank_accounts')
        .insert([{
          account_id: accountId,
          account_number: newAccountNumber,
          customer_id: customerId,
          account_type: linkedAccount.account_type || 'savings',
          balance: 0,
          currency: 'INR',
          status: 'active',
          bank_name: linkedAccount.bank_name,
          ifsc_code: linkedAccount.ifsc_code
        }]);

      if (accountError) {
        result.status = 'error';
        result.message = `Error creating bank account: ${accountError.message}`;
        results.push(result);
        continue;
      }

      result.status = 'success';
      result.message = 'Successfully created customer and bank account';
      result.customer_id = customerId;
      result.account_id = accountId;
      results.push(result);
    }

    res.json({
      success: true,
      message: 'Account fix process completed',
      total_accounts: linkedAccounts.length,
      results: results
    });

  } catch (error) {
    console.error('Admin fix accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix accounts',
      error: error.message
    });
  }
});

module.exports = router;
