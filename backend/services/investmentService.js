const { appDb, bankingDb } = require('../config/supabase');

/**
 * Get comprehensive investment data for a user
 * Fetches stocks, mutual funds, and fixed deposits
 */
const getInvestmentsData = async (userId) => {
  try {
    console.log('📊 Investment Service - Starting for user:', userId);
    
    // TEMPORARY FIX: Use hardcoded mapping for known users
    // TODO: Implement proper account linking when database schema is updated
    const USER_ACCOUNT_MAPPING = {
      '6b867f4e-6461-416e-8f6c-13ae8e177070': '5893143322',
      'f2ef5448-7749-4cd5-8aeb-17221ecd0eae': '5893143322',
      '0f0dd00d-7a4f-4710-826e-7c3db7914bce': '5893143322'
    };

    let accountNumbers = [];

    // Try to get mapped account first
    if (USER_ACCOUNT_MAPPING[userId]) {
      accountNumbers = [USER_ACCOUNT_MAPPING[userId]];
      console.log(`✅ Using mapped account ${accountNumbers[0]} for user ${userId}`);
    } else {
      console.log('⚠️ No mapping found, trying linkedbankaccounts...');
      // Fallback to linked accounts (may not work if account_number is UUID)
      const { data: linkedAccounts, error: linkedError } = await appDb
        .from('linkedbankaccounts')
        .select('*')
        .eq('user_id', userId);

      if (linkedError) {
        throw new Error(`Error fetching linked accounts: ${linkedError.message}`);
      }

      if (!linkedAccounts || linkedAccounts.length === 0) {
        console.log('❌ No linked bank accounts found');
        return {
          totalInvestments: 0,
          stocks: { totalValue: 0, holdings: [], count: 0 },
          mutualFunds: { totalValue: 0, funds: [], count: 0 },
          fixedDeposits: { totalValue: 0, deposits: [], count: 0 },
          breakdown: { stocks: 0, mutualFunds: 0, fixedDeposits: 0 },
          message: 'No linked bank accounts found'
        };
      }

      accountNumbers = linkedAccounts.map(acc => acc.account_number);
      console.log('Found linked accounts:', accountNumbers);
    }

    // Step 2: Get bank accounts from banking database
    console.log('🔍 Fetching bank accounts from banking DB...');
    const { data: bankAccounts, error: bankError } = await bankingDb
      .from('bank_accounts')
      .select('*')
      .in('account_number', accountNumbers);

    if (bankError) {
      console.error('❌ Error fetching bank accounts:', bankError);
      throw new Error(`Error fetching bank accounts: ${bankError.message}`);
    }

    if (!bankAccounts || bankAccounts.length === 0) {
      console.log('❌ No matching bank accounts found in banking database');
      return {
        totalInvestments: 0,
        stocks: { totalValue: 0, holdings: [], count: 0 },
        mutualFunds: { totalValue: 0, funds: [], count: 0 },
        fixedDeposits: { totalValue: 0, deposits: [], count: 0 },
        breakdown: { stocks: 0, mutualFunds: 0, fixedDeposits: 0 },
        message: 'No matching bank accounts found in banking database'
      };
    }

    console.log(`✅ Found ${bankAccounts.length} bank account(s)`);

    // Get customer IDs and account IDs
    const customerIds = [...new Set(bankAccounts.map(acc => acc.customer_id).filter(Boolean))];
    const accountIds = bankAccounts.map(acc => acc.account_id).filter(Boolean);
    
    console.log('Customer IDs:', customerIds);
    console.log('Account IDs:', accountIds);

    // Step 3: Fetch all investment data in parallel
    console.log('🔍 Fetching investment data...');
    const [dematData, mutualFundsData, fixedDepositsData] = await Promise.all([
      // Get demat accounts
      bankingDb
        .from('demat_accounts')
        .select('*')
        .in('customer_id', customerIds),
      // Get mutual funds
      bankingDb
        .from('mutual_funds')
        .select('*')
        .in('customer_id', customerIds),
      // Get fixed deposits
      bankingDb
        .from('fixed_deposits')
        .select('*')
        .in('customer_id', customerIds)
        .in('account_id', accountIds)
    ]);
    
    console.log('📊 Investment data fetched:');
    console.log('  - Demat accounts:', dematData.data?.length || 0);
    console.log('  - Mutual funds:', mutualFundsData.data?.length || 0);
    console.log('  - Fixed deposits:', fixedDepositsData.data?.length || 0);

    // Step 4: Get stock holdings
    const dematIds = dematData.data?.map(d => d.demat_id).filter(Boolean) || [];
    let holdings = [];
    
    if (dematIds.length > 0) {
      console.log('🔍 Fetching holdings for demat IDs:', dematIds);
      const { data: holdingsData } = await bankingDb
        .from('holdings')
        .select('*')
        .in('demat_id', dematIds);
      holdings = holdingsData || [];
      console.log('  - Holdings:', holdings.length);
    } else {
      console.log('⚠️ No demat accounts found, skipping holdings fetch');
    }

    // Step 5: Calculate totals
    const stocksTotal = holdings.reduce((sum, holding) => {
      return sum + (holding.quantity * holding.current_price);
    }, 0);

    const mutualFundsTotal = mutualFundsData.data?.reduce((sum, fund) => {
      return sum + parseFloat(fund.current_value || 0);
    }, 0) || 0;

    const fixedDepositsTotal = fixedDepositsData.data?.reduce((sum, fd) => {
      return sum + parseFloat(fd.deposit_amount || 0);
    }, 0) || 0;

    const totalInvestments = stocksTotal + mutualFundsTotal + fixedDepositsTotal;

    // Step 6: Calculate P&L for stocks
    const stocksWithPnL = holdings.map(holding => {
      const investedValue = holding.quantity * holding.bought_price;
      const currentValue = holding.quantity * holding.current_price;
      const profitLoss = currentValue - investedValue;
      const profitLossPercentage = investedValue > 0 
        ? ((profitLoss / investedValue) * 100).toFixed(2) 
        : 0;

      return {
        stock_name: holding.name || holding.stock_name, // Support both field names
        quantity: holding.quantity,
        bought_price: holding.bought_price,
        current_price: holding.current_price,
        invested_value: investedValue,
        current_value: currentValue,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage
      };
    });

    const totalStocksProfitLoss = stocksWithPnL.reduce((sum, stock) => sum + stock.profit_loss, 0);
    const totalStocksInvested = stocksWithPnL.reduce((sum, stock) => sum + stock.invested_value, 0);
    const stocksProfitLossPercentage = totalStocksInvested > 0 
      ? ((totalStocksProfitLoss / totalStocksInvested) * 100).toFixed(2) 
      : 0;

    // Step 7: Calculate P&L for mutual funds
    const mutualFundsWithPnL = mutualFundsData.data?.map(fund => {
      const investedValue = parseFloat(fund.invested_amount || 0);
      const currentValue = parseFloat(fund.current_value || 0);
      const profitLoss = currentValue - investedValue;
      const profitLossPercentage = investedValue > 0 
        ? ((profitLoss / investedValue) * 100).toFixed(2) 
        : 0;

      return {
        fund_name: fund.fund_name,
        units: fund.units,
        nav: fund.nav,
        invested_amount: investedValue,
        current_value: currentValue,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage
      };
    }) || [];

    const totalMFProfitLoss = mutualFundsWithPnL.reduce((sum, fund) => sum + fund.profit_loss, 0);
    const totalMFInvested = mutualFundsWithPnL.reduce((sum, fund) => sum + fund.invested_amount, 0);
    const mfProfitLossPercentage = totalMFInvested > 0 
      ? ((totalMFProfitLoss / totalMFInvested) * 100).toFixed(2) 
      : 0;

    // Step 8: Format fixed deposits with calculated interest
    const formattedFDs = fixedDepositsData.data?.map(fd => {
      const amount = parseFloat(fd.deposit_amount || 0);
      const interestRate = parseFloat(fd.interest_rate || 0);
      const tenureMonths = parseInt(fd.tenure_months || 0);
      
      // Calculate interest earned: Simple Interest = (P × R × T) / 100
      // T is in years, so convert months to years
      const tenureYears = tenureMonths / 12;
      const calculatedInterest = (amount * interestRate * tenureYears) / 100;
      
      const interestEarned = fd.interest_earned ? parseFloat(fd.interest_earned) : calculatedInterest;

      return {
        amount: amount,
        interest_rate: interestRate,
        tenure_months: tenureMonths,
        maturity_date: fd.maturity_date,
        interest_earned: Math.round(interestEarned * 100) / 100, // Round to 2 decimal places
        maturity_amount: Math.round((amount + interestEarned) * 100) / 100
      };
    }) || [];

    const totalFDInterest = formattedFDs.reduce((sum, fd) => sum + fd.interest_earned, 0);

    return {
      totalInvestments,
      stocks: {
        totalValue: stocksTotal,
        holdings: stocksWithPnL,
        count: stocksWithPnL.length,
        totalProfitLoss: totalStocksProfitLoss,
        profitLossPercentage: stocksProfitLossPercentage
      },
      mutualFunds: {
        totalValue: mutualFundsTotal,
        funds: mutualFundsWithPnL,
        count: mutualFundsWithPnL.length,
        totalProfitLoss: totalMFProfitLoss,
        profitLossPercentage: mfProfitLossPercentage
      },
      fixedDeposits: {
        totalValue: fixedDepositsTotal,
        deposits: formattedFDs,
        count: formattedFDs.length,
        totalInterest: totalFDInterest
      },
      breakdown: {
        stocks: stocksTotal,
        mutualFunds: mutualFundsTotal,
        fixedDeposits: fixedDepositsTotal
      },
      percentageBreakdown: totalInvestments > 0 ? {
        stocks: ((stocksTotal / totalInvestments) * 100).toFixed(2),
        mutualFunds: ((mutualFundsTotal / totalInvestments) * 100).toFixed(2),
        fixedDeposits: ((fixedDepositsTotal / totalInvestments) * 100).toFixed(2)
      } : null
    };

  } catch (error) {
    console.error('Investment service error:', error);
    throw error;
  }
};

module.exports = {
  getInvestmentsData
};
