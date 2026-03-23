const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Database Configuration
 * Creates and exports database clients for Banking DB and Application DB
 * Banking DB: Contains financial data (accounts, transactions, holdings, etc.)
 * Application DB: Contains user data (profiles, account mappings, preferences)
 */

// Banking Database Configuration
const bankingDbUrl = process.env.BANKING_DB_URL;
const bankingDbKey = process.env.BANKING_DB_ANON_KEY;

// Application Database Configuration  
const appDbUrl = process.env.APP_DB_URL;
const appDbKey = process.env.APP_DB_ANON_KEY;

// Validate required environment variables
if (!bankingDbUrl || !bankingDbKey) {
  throw new Error('Missing Banking DB environment variables. Please check BANKING_DB_URL and BANKING_DB_ANON_KEY');
}

if (!appDbUrl || !appDbKey) {
  throw new Error('Missing Application DB environment variables. Please check APP_DB_URL and APP_DB_ANON_KEY');
}

// Create Supabase database clients
const bankingDb = createClient(bankingDbUrl, bankingDbKey);
const appDb = createClient(appDbUrl, appDbKey);

module.exports = {
  bankingDb,   // For financial data operations
  appDb        // For user data operations
};