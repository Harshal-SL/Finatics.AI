/**
 * Thorough cross-check of loan metrics calculation
 * This will show detailed breakdown of all transactions and calculations
 */

const { bankingDb, appDb } = require('../config/supabase');

const userId = '6b867f4e-6461-416e-8f6c-13ae8e177070';
const accountNumber = '5893143322';

async function thoroughCrossCheck() {
  console.log('='.repeat(80));
  console.log('THOROUGH CROSS-CHECK: Loan Metrics Calculation');
  console.log('='.repeat(80));
  console.log('User ID:', userId);
  console.log('Account Number:', accountNumber);
  console.log('='.repeat(80));
  console.log('\n');

  try {
    // Step 1: Get linked accounts
    const { data: links, error: linksErr } = await appDb
      .from('linkedbankaccounts')
      .select('account_number, bank_name')
      .eq('user_id', userId);
    
    if (linksErr) {
      console.error('Error:', linksErr);
      return;
    }
    
    console.log('Linked accounts from App DB:', JSON.stringify(links, null, 2));
    const accountRefs = (links || []).map(l => l.account_number).filter(Boolean);

    // Step 2: Get bank account
    const { data: directAccount, error: directErr } = await bankingDb
      .from('bank_accounts')
      .select('account_id, customer_id, account_number, account_holder, balance')
      .eq('account_number', accountNumber);
    
    if (directErr || !directAccount || directAccount.length === 0) {
      console.error('Error fetching bank account:', directErr);
      return;
    }

    console.log('\nBank Account Details:');
    console.log(JSON.stringify(directAccount[0], null, 2));
    
    const accountId = directAccount[0].account_id;
    const customerId = directAccount[0].customer_id;

    // Step 3: Get credit score
    const { data: customer, error: custErr } = await bankingDb
      .from('customers')
      .select('customer_id, credit_score, customer_name')
      .eq('customer_id', customerId)
      .single();
    
    if (!custErr && customer) {
      console.log('\nCustomer Info:');
      console.log(`  Name: ${customer.customer_name}`);
      console.log(`  Credit Score: ${customer.credit_score}`);
    }

    // Step 4: Get transactions for last 3 months
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(startOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000);
    const prevMonth = lastDayPrevMonth.getMonth();
    const prevYear = lastDayPrevMonth.getFullYear();
    const startThreeMonthsAgo = new Date(prevYear, prevMonth - 2, 1);
    
    console.log('\n' + '='.repeat(80));
    console.log('TRANSACTION ANALYSIS - Last 3 Full Months');
    console.log('='.repeat(80));
    console.log('Date Range:');
    console.log(`  From: ${startThreeMonthsAgo.toISOString().split('T')[0]}`);
    console.log(`  To: ${lastDayPrevMonth.toISOString().split('T')[0]}`);
    console.log('');

    const { data: allTxns, error: txErr } = await bankingDb
      .from('transactions')
      .select('txn_id, txn_type, amount, txn_date, description, category, balance_after')
      .eq('account_id', accountId)
      .gte('txn_date', startThreeMonthsAgo.toISOString().split('T')[0])
      .lte('txn_date', lastDayPrevMonth.toISOString().split('T')[0])
      .order('txn_date', { ascending: true });
    
    if (txErr) {
      console.error('Error fetching transactions:', txErr);
      return;
    }

    console.log(`Total transactions found: ${allTxns?.length || 0}\n`);

    // Group by month and calculate
    const monthlyData = new Map();
    const transactionsByMonth = new Map();

    for (const txn of allTxns || []) {
      const date = new Date(txn.txn_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0, credits: [], debits: [] });
        transactionsByMonth.set(monthKey, []);
      }
      
      const monthData = monthlyData.get(monthKey);
      const monthTxns = transactionsByMonth.get(monthKey);
      
      const amount = parseFloat(txn.amount || 0);
      const txnTypeLower = (txn.txn_type || '').toLowerCase();
      
      if (txnTypeLower === 'credit' || txnTypeLower === 'deposit') {
        monthData.income += amount;
        monthData.credits.push({ amount, date: txn.txn_date, desc: txn.description });
      } else if (txnTypeLower === 'debit' || txnTypeLower === 'withdrawal') {
        monthData.expenses += amount;
        monthData.debits.push({ amount, date: txn.txn_date, desc: txn.description });
      }
      
      monthTxns.push(txn);
    }

    // Display detailed breakdown
    const monthKeys = Array.from(monthlyData.keys()).sort();
    
    for (const monthKey of monthKeys) {
      const monthData = monthlyData.get(monthKey);
      const monthTxns = transactionsByMonth.get(monthKey);
      const savings = monthData.income - monthData.expenses;
      
      console.log('='.repeat(80));
      console.log(`MONTH: ${monthKey}`);
      console.log('='.repeat(80));
      console.log(`Total Transactions: ${monthTxns.length}`);
      console.log('');
      
      console.log(`CREDIT/INCOME Transactions: ${monthData.credits.length}`);
      monthData.credits.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ₹${c.amount.toLocaleString('en-IN')} - ${c.desc} (${c.date.split('T')[0]})`);
      });
      console.log(`  TOTAL INCOME: ₹${monthData.income.toLocaleString('en-IN')}`);
      console.log('');
      
      console.log(`DEBIT/EXPENSE Transactions: ${monthData.debits.length}`);
      monthData.debits.forEach((d, idx) => {
        console.log(`  ${idx + 1}. ₹${d.amount.toLocaleString('en-IN')} - ${d.desc} (${d.date.split('T')[0]})`);
      });
      console.log(`  TOTAL EXPENSES: ₹${monthData.expenses.toLocaleString('en-IN')}`);
      console.log('');
      
      console.log(`NET SAVINGS FOR ${monthKey}: ₹${savings.toLocaleString('en-IN')}`);
      console.log('');
    }

    // Calculate averages
    const months = Array.from(monthlyData.values());
    const monthsConsidered = months.length;
    
    const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;
    
    const avgIncome = monthsConsidered > 0 ? totalIncome / monthsConsidered : 0;
    const avgExpenses = monthsConsidered > 0 ? totalExpenses / monthsConsidered : 0;
    const avgSavings = avgIncome - avgExpenses;

    console.log('='.repeat(80));
    console.log('FINAL SUMMARY - AVERAGE OVER ' + monthsConsidered + ' MONTHS');
    console.log('='.repeat(80));
    console.log(`Total Income (all ${monthsConsidered} months): ₹${totalIncome.toLocaleString('en-IN')}`);
    console.log(`Total Expenses (all ${monthsConsidered} months): ₹${totalExpenses.toLocaleString('en-IN')}`);
    console.log(`Total Savings (all ${monthsConsidered} months): ₹${totalSavings.toLocaleString('en-IN')}`);
    console.log('');
    console.log(`Average Monthly Income: ₹${avgIncome.toLocaleString('en-IN')}`);
    console.log(`Average Monthly Expenses: ₹${avgExpenses.toLocaleString('en-IN')}`);
    console.log(`Average Monthly Savings: ₹${avgSavings.toLocaleString('en-IN')}`);
    console.log('');
    
    if (avgSavings < 0) {
      console.log('⚠️  WARNING: Average savings is NEGATIVE');
      console.log('   This means the user is spending more than earning on average.');
      console.log(`   Monthly deficit: ₹${Math.abs(avgSavings).toLocaleString('en-IN')}`);
    } else {
      console.log('✅ Average savings is POSITIVE');
      console.log(`   Monthly surplus: ₹${avgSavings.toLocaleString('en-IN')}`);
    }
    console.log('='.repeat(80));

    // Verification
    console.log('\nVERIFICATION:');
    console.log(`  avgIncome - avgExpenses = ${avgIncome.toFixed(2)} - ${avgExpenses.toFixed(2)} = ${avgSavings.toFixed(2)}`);
    console.log(`  Match: ${(avgIncome - avgExpenses).toFixed(2) === avgSavings.toFixed(2) ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

thoroughCrossCheck();
