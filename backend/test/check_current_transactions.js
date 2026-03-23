/**
 * Check current transactions data in the banking database
 * This will fetch the latest transactions to verify current state
 */

const { bankingDb } = require('../config/supabase');

const accountNumber = '5893143322';

async function checkCurrentTransactions() {
  console.log('='.repeat(80));
  console.log('CHECKING CURRENT TRANSACTIONS DATA IN DATABASE');
  console.log('='.repeat(80));
  console.log('Account Number:', accountNumber);
  console.log('Current Date:', new Date().toISOString().split('T')[0]);
  console.log('='.repeat(80));
  console.log('\n');

  try {
    // Get bank account details
    const { data: account, error: accErr } = await bankingDb
      .from('bank_accounts')
      .select('account_id, customer_id, account_number, account_holder, balance, account_type, bank_name')
      .eq('account_number', accountNumber)
      .single();
    
    if (accErr || !account) {
      console.error('Error fetching account:', accErr);
      return;
    }

    console.log('ACCOUNT DETAILS:');
    console.log(JSON.stringify(account, null, 2));
    console.log('\n');

    const accountId = account.account_id;

    // Get total transaction count
    const { count: totalCount, error: countErr } = await bankingDb
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    console.log(`Total Transactions in DB for this account: ${totalCount || 0}`);
    console.log('\n');

    // Get latest 20 transactions
    console.log('='.repeat(80));
    console.log('LATEST 20 TRANSACTIONS (Most Recent First)');
    console.log('='.repeat(80));

    const { data: latestTxns, error: latestErr } = await bankingDb
      .from('transactions')
      .select('txn_id, txn_type, amount, txn_date, description, category, balance_after')
      .eq('account_id', accountId)
      .order('txn_date', { ascending: false })
      .limit(20);
    
    if (latestErr) {
      console.error('Error fetching latest transactions:', latestErr);
      return;
    }

    latestTxns.forEach((txn, idx) => {
      console.log(`${idx + 1}. [${txn.txn_date.split('T')[0]}] ${txn.txn_type} - ₹${txn.amount.toLocaleString('en-IN')}`);
      console.log(`   ${txn.description} | Category: ${txn.category}`);
      console.log(`   Balance After: ₹${txn.balance_after?.toLocaleString('en-IN') || 'N/A'}`);
      console.log('');
    });

    // Get transactions by date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log('='.repeat(80));
    console.log('TRANSACTIONS IN LAST 30 DAYS');
    console.log('='.repeat(80));
    console.log(`Date Range: ${thirtyDaysAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`);
    console.log('\n');

    const { data: recentTxns, error: recentErr } = await bankingDb
      .from('transactions')
      .select('txn_type, amount, txn_date')
      .eq('account_id', accountId)
      .gte('txn_date', thirtyDaysAgo.toISOString().split('T')[0])
      .lte('txn_date', today.toISOString().split('T')[0]);
    
    if (recentErr) {
      console.error('Error:', recentErr);
      return;
    }

    console.log(`Total transactions in last 30 days: ${recentTxns?.length || 0}`);

    // Calculate totals
    let totalCredit = 0;
    let totalDebit = 0;

    (recentTxns || []).forEach(txn => {
      const amount = parseFloat(txn.amount || 0);
      const txnTypeLower = (txn.txn_type || '').toLowerCase();
      
      if (txnTypeLower === 'credit' || txnTypeLower === 'deposit') {
        totalCredit += amount;
      } else if (txnTypeLower === 'debit' || txnTypeLower === 'withdrawal') {
        totalDebit += amount;
      }
    });

    console.log(`Total Credits (Income): ₹${totalCredit.toLocaleString('en-IN')}`);
    console.log(`Total Debits (Expenses): ₹${totalDebit.toLocaleString('en-IN')}`);
    console.log(`Net Change: ₹${(totalCredit - totalDebit).toLocaleString('en-IN')}`);
    console.log('\n');

    // Get October 2025 transactions specifically
    console.log('='.repeat(80));
    console.log('OCTOBER 2025 TRANSACTIONS (Current Month)');
    console.log('='.repeat(80));

    const { data: octoberTxns, error: octErr } = await bankingDb
      .from('transactions')
      .select('txn_type, amount, txn_date, description')
      .eq('account_id', accountId)
      .gte('txn_date', '2025-10-01')
      .lte('txn_date', '2025-10-31')
      .order('txn_date', { ascending: false });
    
    if (octErr) {
      console.error('Error:', octErr);
    } else {
      console.log(`Total October transactions: ${octoberTxns?.length || 0}`);
      
      if (octoberTxns && octoberTxns.length > 0) {
        console.log('\nOctober Transactions:');
        octoberTxns.forEach((txn, idx) => {
          console.log(`${idx + 1}. [${txn.txn_date.split('T')[0]}] ${txn.txn_type} - ₹${txn.amount.toLocaleString('en-IN')} - ${txn.description}`);
        });

        let octCredit = 0;
        let octDebit = 0;
        octoberTxns.forEach(txn => {
          const amount = parseFloat(txn.amount || 0);
          const txnTypeLower = (txn.txn_type || '').toLowerCase();
          if (txnTypeLower === 'credit' || txnTypeLower === 'deposit') {
            octCredit += amount;
          } else if (txnTypeLower === 'debit' || txnTypeLower === 'withdrawal') {
            octDebit += amount;
          }
        });

        console.log(`\nOctober Income: ₹${octCredit.toLocaleString('en-IN')}`);
        console.log(`October Expenses: ₹${octDebit.toLocaleString('en-IN')}`);
        console.log(`October Savings: ₹${(octCredit - octDebit).toLocaleString('en-IN')}`);
      } else {
        console.log('No transactions found for October 2025 yet.');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('DATABASE CHECK COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCurrentTransactions();
