/**
 * Database Connection Test Utility
 * 
 * This script validates connectivity and data integrity across both database instances:
 * - Banking Database: Contains financial data (accounts, transactions, holdings, etc.)
 * - Application Database: Contains user data and account linkages
 * 
 * Usage: node test/test_db_connections.js
 */

require('dotenv').config();
const { bankingDb, appDb } = require('../config/supabase');

/**
 * Main function to test database connections and data integrity
 * Performs comprehensive testing of both database instances
 */
async function testDatabaseConnections() {
  console.log('Database Connection Validation');
  console.log('==============================');
  
  try {
    // Test Banking Database connectivity
    await testBankingDatabaseConnection();
    
    // Test Application Database connectivity  
    await testApplicationDatabaseConnection();
    
    // Validate specific test user data
    await validateTestUserData();
    
    // Test Banking Database with known test account
    await testKnownBankingAccount();
    
    // Validate transaction data integrity
    await validateTransactionData();
    
  } catch (error) {
    console.error('CRITICAL ERROR: Unexpected database error:', error.message);
    throw error;
  }
}

/**
 * Tests Banking Database connection and basic data retrieval
 */
async function testBankingDatabaseConnection() {
  console.log('\nTesting Banking Database Connection...');
  
  const bankingTest = await bankingDb
    .from('bank_accounts')
    .select('account_number, balance')
    .limit(1);
  
  if (bankingTest.error) {
    console.error('ERROR: Banking Database connection failed:', bankingTest.error.message);
    throw new Error('Banking Database unavailable');
  } else {
    console.log('SUCCESS: Banking Database connected successfully');
    console.log(`   Records found: ${bankingTest.data.length}`);
    if (bankingTest.data.length > 0) {
      console.log(`   Sample account: ${bankingTest.data[0].account_number} (Balance: ₹${bankingTest.data[0].balance})`);
    }
  }
}

/**
 * Tests Application Database connection and user table access
 */
async function testApplicationDatabaseConnection() {
  console.log('\nTesting Application Database Connection...');
  
  // Note: Using user_id and email instead of name due to schema differences
  const appTest = await appDb
    .from('users')
    .select('user_id, email')
    .limit(1);
  
  if (appTest.error) {
    console.error('ERROR: Application Database connection failed:', appTest.error.message);
    throw new Error('Application Database unavailable');
  } else {
    console.log('SUCCESS: Application Database connected successfully');
    console.log(`   Records found: ${appTest.data.length}`);
    if (appTest.data.length > 0) {
      console.log(`   Sample user: ${appTest.data[0].email} (ID: ${appTest.data[0].user_id})`);
    }
  }
}

/**
 * Validates test user data and account linkages
 */
async function validateTestUserData() {
  console.log('\nValidating Test User Data...');
  
  // Test user ID from database
  const testUserId = '2b06a9d7-a452-45a4-a31e-38e7c411c7ab';
  
  // Verify user exists in Application Database
  const userCheck = await appDb
    .from('users')
    .select('*')
    .eq('user_id', testUserId)
    .single();
  
  if (userCheck.error) {
    console.error('ERROR: Test user not found in Application Database:', userCheck.error.message);
    throw new Error('Test user data missing');
  } else {
    console.log('SUCCESS: Test user found in Application Database');
    console.log(`   Email: ${userCheck.data.email}`);
    console.log(`   Created: ${userCheck.data.created_at}`);
  }
  
  // Validate linked bank accounts for test user
  const linkedAccounts = await appDb
    .from('linked_bank_accounts')
    .select('*')
    .eq('user_id', testUserId);
  
  if (linkedAccounts.error) {
    console.error('ERROR: Cannot fetch linked accounts:', linkedAccounts.error.message);
    throw new Error('Linked accounts query failed');
  } else {
    console.log(`SUCCESS: Found ${linkedAccounts.data.length} linked account(s)`);
    linkedAccounts.data.forEach((account, index) => {
      console.log(`   Account ${index + 1}: UUID ${account.account_ref_id}`);
      console.log(`   Linked on: ${account.linked_at}`);
    });
  }
}

/**
 * Tests Banking Database with known test account
 */
async function testKnownBankingAccount() {
  console.log('\nTesting Known Banking Account...');
  
  // Known test account number from database
  const testAccountNumber = '5893143322';
  
  const bankingAccountTest = await bankingDb
    .from('bank_accounts')
    .select('*')
    .eq('account_number', testAccountNumber)
    .single();
  
  if (bankingAccountTest.error) {
    console.error('ERROR: Test banking account not found:', bankingAccountTest.error.message);
    throw new Error('Banking account data missing');
  } else {
    console.log('SUCCESS: Test banking account found');
    console.log(`   Account Number: ${bankingAccountTest.data.account_number}`);
    console.log(`   Current Balance: ₹${bankingAccountTest.data.balance}`);
    console.log(`   Customer ID: ${bankingAccountTest.data.customer_id}`);
  }
}

/**
 * Validates transaction data availability and count
 */
async function validateTransactionData() {
  console.log('\nValidating Transaction Data...');
  
  // Count transactions for account_id 1 (corresponds to test account 5893143322)
  const transactionCount = await bankingDb
    .from('transactions')
    .select('txn_id', { count: 'exact' })
    .eq('account_id', 1);
  
  if (transactionCount.error) {
    console.error('ERROR: Cannot count transactions:', transactionCount.error.message);
    throw new Error('Transaction data query failed');
  } else {
    console.log(`SUCCESS: Transaction data validated`);
    console.log(`   Total transactions for account_id 1: ${transactionCount.count}`);
  }
}

/**
 * Execute database connection tests
 * Handles graceful exit and error reporting
 */
testDatabaseConnections()
  .then(() => {
    console.log('\nDatabase Connection Test: PASSED');
    console.log('All database connections are operational and data integrity is validated.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDatabase Connection Test: FAILED');
    console.error('Error details:', error.message);
    process.exit(1);
  });