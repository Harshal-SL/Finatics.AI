/**
 * Debug script to check loan metrics calculation
 * This will help us see what's happening with the savings/expenses calculation
 */

const { bankingDb, appDb } = require('../config/supabase');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const accountNumber = '5893143322';

async function debugLoanMetrics() {
  console.log('='.repeat(70));
  console.log('DEBUG: Loan Metrics Calculation');
  console.log('='.repeat(70));
  console.log('User ID:', userId);
  console.log('Account Number:', accountNumber);
  console.log('='.repeat(70));
  console.log('\n');

  try {
    // Step 1: Get linked accounts from App DB
    console.log('Step 1: Fetching linked accounts from App DB...');
    const { data: links, error: linksErr } = await appDb
      .from('linkedbankaccounts')
      .select('account_number, bank_name')
      .eq('user_id', userId);
    
    if (linksErr) {
      console.error('Error fetching linked accounts:', linksErr);
      return;
    }
    
    console.log('Linked accounts:', JSON.stringify(links, null, 2));
    const accountRefs = (links || []).map(l => l.account_number).filter(Boolean);
    console.log('Account numbers to lookup:', accountRefs);
    console.log('\n');

    // Step 2: Get bank account details from Banking DB
    console.log('Step 2: Fetching bank accounts from Banking DB...');
    const { data: bankAccounts, error: bankErr } = await bankingDb
      .from('bank_accounts')
      .select('account_id, customer_id, account_number')
      .in('account_number', accountRefs);
    
    if (bankErr) {
      console.error('Error fetching bank accounts:', bankErr);
    }
    
    console.log('Bank accounts found:', JSON.stringify(bankAccounts, null, 2));
    
    if (!bankAccounts || bankAccounts.length === 0) {
      console.log('⚠️  No bank accounts found - using account number directly');
      
      // Try with specific account number
      const { data: directAccount, error: directErr } = await bankingDb
        .from('bank_accounts')
        .select('account_id, customer_id, account_number')
        .eq('account_number', accountNumber);
      
      console.log('Direct account lookup result:', JSON.stringify(directAccount, null, 2));
      
      if (directAccount && directAccount.length > 0) {
        bankAccounts.push(...directAccount);
      }
    }
    
    const accountIds = (bankAccounts || []).map(a => a.account_id);
    console.log('Account IDs for transaction lookup:', accountIds);
    console.log('\n');

    // Step 3: Get transactions
    console.log('Step 3: Fetching transactions...');
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(startOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000);
    const prevMonth = lastDayPrevMonth.getMonth();
    const prevYear = lastDayPrevMonth.getFullYear();
    const startThreeMonthsAgo = new Date(prevYear, prevMonth - 2, 1);
    
    console.log('Date range (last 3 full months):');
    console.log('  From:', startThreeMonthsAgo.toISOString().split('T')[0]);
    console.log('  To:', lastDayPrevMonth.toISOString().split('T')[0]);
    console.log('\n');

    const { data: txns, error: txErr } = await bankingDb
      .from('transactions')
      .select('txn_type, amount, txn_date, account_id, description')
      .in('account_id', accountIds)
      .gte('txn_date', startThreeMonthsAgo.toISOString().split('T')[0])
      .lte('txn_date', lastDayPrevMonth.toISOString().split('T')[0])
      .order('txn_date', { ascending: false })
      .limit(50);
    
    if (txErr) {
      console.error('Error fetching transactions:', txErr);
      return;
    }
    
    console.log(`Found ${txns?.length || 0} transactions`);
    console.log('\nSample transactions (first 10):');
    (txns || []).slice(0, 10).forEach((t, idx) => {
      console.log(`  ${idx + 1}. Type: "${t.txn_type}" | Amount: ₹${t.amount} | Date: ${t.txn_date}`);
      console.log(`     Description: ${t.description}`);
    });
    console.log('\n');

    // Step 4: Check unique transaction types
    const uniqueTypes = [...new Set((txns || []).map(t => t.txn_type))];
    console.log('Unique transaction types found:', uniqueTypes);
    console.log('\n');

    // Step 5: Calculate metrics with case-insensitive matching
    console.log('Step 4: Calculating metrics...');
    const byMonth = new Map();
    for (const t of txns || []) {
      const d = new Date(t.txn_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = byMonth.get(key) || { income: 0, expenses: 0 };
      const amount = parseFloat(t.amount || 0);
      const txnTypeLower = (t.txn_type || '').toLowerCase();
      
      if (txnTypeLower === 'credit' || txnTypeLower === 'deposit') {
        entry.income += amount;
      } else if (txnTypeLower === 'debit' || txnTypeLower === 'withdrawal') {
        entry.expenses += amount;
      }
      byMonth.set(key, entry);
    }

    console.log('\nMonthly breakdown:');
    byMonth.forEach((value, key) => {
      const savings = value.income - value.expenses;
      console.log(`  ${key}:`);
      console.log(`    Income: ₹${value.income.toFixed(2)}`);
      console.log(`    Expenses: ₹${value.expenses.toFixed(2)}`);
      console.log(`    Savings: ₹${savings.toFixed(2)}`);
    });

    const months = Array.from(byMonth.values());
    const monthsConsidered = months.length;
    const avgIncome = months.length ? months.reduce((s, m) => s + m.income, 0) / months.length : 0;
    const avgExpenses = months.length ? months.reduce((s, m) => s + m.expenses, 0) / months.length : 0;
    const avgSavings = avgIncome - avgExpenses;

    console.log('\n' + '='.repeat(70));
    console.log('FINAL METRICS:');
    console.log('='.repeat(70));
    console.log('Months Considered:', monthsConsidered);
    console.log('Average Income: ₹', avgIncome.toFixed(2));
    console.log('Average Expenses: ₹', avgExpenses.toFixed(2));
    console.log('Average Savings: ₹', avgSavings.toFixed(2));
    console.log('='.repeat(70));

  } catch (error) {
    console.error('Error:', error);
  }
}

debugLoanMetrics();
