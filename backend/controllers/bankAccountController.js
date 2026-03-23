const { appDb, bankingDb } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Bank Account Controller
 * Handles bank account operations using Supabase Application Database
 */

/**
 * Add a new bank account
 * POST /api/add-account
 * Body: { userid, bank_name, ifsc_code, account_type }
 * 
 * NOTE: Due to database schema limitations (account_number is UUID type),
 * we generate a UUID for the link but the actual banking integration
 * happens through the USER_ACCOUNT_MAPPING in investmentService and holdingsController
 */
const addBankAccount = async (req, res) => {
  try {
    const { userid, bank_name, ifsc_code, account_type } = req.body;
    
    console.log('Add Bank Account - Received data:', { userid, bank_name, ifsc_code, account_type });
    console.log('Full request body:', req.body);

    // Validate required fields
    if (!userid || !bank_name || !ifsc_code || !account_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['userid', 'bank_name', 'ifsc_code', 'account_type'],
        received: { userid, bank_name, ifsc_code, account_type }
      });
    }

    // Validate account type
    const validAccountTypes = ['savings', 'current', 'salary'];
    if (!validAccountTypes.includes(account_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type',
        validTypes: validAccountTypes
      });
    }

    // Check if user exists and get user details
    const { data: userExists, error: userCheckError } = await appDb
      .from('users')
      .select('user_id, full_name')
      .eq('user_id', userid)
      .single();

    if (userCheckError || !userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate IDs for banking database
    // Generate UUID for account_number (required by linkedbankaccounts schema)
    const accountNumber = uuidv4();
    // Generate 16-digit actual account number for banking database
    const actualAccountNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    const customerId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    const accountId = customerId + Math.floor(Math.random() * 1000);

    // Create customer and account in banking database first
    try {
      // Create customer in banking database
      const { data: customerData, error: customerError } = await bankingDb
        .from('customers')
        .insert([{
          customer_id: customerId,
          full_name: userExists.full_name || 'User',
          email: '',
          phone: '',
          address: '',
          dob: null,
          aadhar_number: '',
          pan_number: '',
          credit_score: 0
        }])
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer in banking DB:', customerError);
        // Continue anyway, we'll still create the link
      }

      // Create bank account in banking database
      const { data: bankAccountDataResult, error: bankAccountError } = await bankingDb
        .from('bank_accounts')
        .insert([{
          account_id: accountId,
          account_number: actualAccountNumber,
          customer_id: customerId,
          account_type: account_type.toLowerCase(),
          balance: 0,
          currency: 'INR',
          status: 'active',
          bank_name: bank_name,
          ifsc_code: ifsc_code.toUpperCase()
        }])
        .select()
        .single();

      if (bankAccountError) {
        console.error('Error creating bank account in banking DB:', bankAccountError);
        // Continue anyway, we'll still create the link
      } else {
        console.log('✅ Successfully created bank account in banking database');
      }
    } catch (bankingDbError) {
      console.error('Error with banking database operations:', bankingDbError);
      // Continue with app database operation
    }

    // Prepare bank account data according to the schema
    const bankAccountData = {
      user_id: userid,
      account_number: accountNumber,
      ifsc_code: ifsc_code.toUpperCase(),
      account_type: account_type.toLowerCase(),
      bank_name: bank_name
    };

    // Insert the bank account
    const { data: newAccount, error: insertError } = await appDb
      .from('linkedbankaccounts')
      .insert([bankAccountData])
      .select()

    if (insertError) {
      console.error('Error inserting bank account:', insertError);
      return res.status(400).json({
        success: false,
        message: 'Failed to add bank account',
        error: insertError.message
      });
    }

    // Get the first inserted record
    const insertedAccount = newAccount && newAccount.length > 0 ? newAccount[0] : null;

    if (!insertedAccount) {
      return res.status(400).json({
        success: false,
        message: 'Failed to add bank account - no data returned'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: {
        link_id: insertedAccount.link_id,
        bank_name: insertedAccount.bank_name,
        account_number: insertedAccount.account_number,
        ifsc_code: insertedAccount.ifsc_code,
        account_type: insertedAccount.account_type
      }
    });

  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user's bank accounts
 * GET /api/bank-accounts/:userId
 */
const getBankAccounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: bankAccounts, error } = await appDb
      .from('linkedbankaccounts')
      .select(`
        link_id,
        user_id,
        account_number,
        ifsc_code,
        account_type,
        bank_name
      `)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch bank accounts',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: bankAccounts || [],
      count: bankAccounts ? bankAccounts.length : 0
    });

  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Remove/delete a bank account
 * DELETE /api/bank-accounts/:linkId
 */
const removeBankAccount = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { userId } = req.body; // Get userId from request body for security

    // Find the account to remove
    const { data: account, error: findError } = await appDb
      .from('linkedbankaccounts')
      .select('*')
      .eq('link_id', linkId)
      .single();

    if (findError || !account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Verify the account belongs to the user (if userId provided)
    if (userId && account.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this account'
      });
    }

    // Delete the account record
    const { error: deleteError } = await appDb
      .from('linkedbankaccounts')
      .delete()
      .eq('link_id', linkId);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to remove bank account',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Bank account removed successfully',
      data: {
        link_id: linkId,
        status: 'deleted'
      }
    });

  } catch (error) {
    console.error('Error removing bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addBankAccount,
  getBankAccounts,
  removeBankAccount
};