const { bankingDb, appDb } = require('../config/supabase');
const { fetchMultipleStockPrices, extractSymbol } = require('../services/nseStockService');

/**
 * Holdings Controller
 * Handles stock holdings operations from Banking Database
 * Holdings are linked to demat accounts, which are linked to customers
 */

/**
 * Get user's stock holdings
 * GET /api/holdings/:userId
 * Optional query params: ?accountNumber=xxx to filter by specific bank account
 */
const getUserHoldings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountNumber } = req.query;

    console.log(`Fetching holdings for user: ${userId}${accountNumber ? `, account: ${accountNumber}` : ''}`);

    // Temporary user-to-account mapping
    // TODO: Replace with linkedbankaccounts table query when properly configured
    const USER_ACCOUNT_MAPPING = {
      '6b867f4e-6461-416e-8f6c-13ae8e177070': '5893143322',
      'f2ef5448-7749-4cd5-8aeb-17221ecd0eae': '5893143322',
      '0f0dd00d-7a4f-4710-826e-7c3db7914bce': '5893143322'
    };

    const linkedAccountNumber = USER_ACCOUNT_MAPPING[userId];

    if (!linkedAccountNumber) {
      return res.status(404).json({
        success: false,
        message: 'No linked bank account found for this user. Please link a bank account first.',
        error: 'User has no active linked accounts'
      });
    }

    console.log(`Using mapped account: ${linkedAccountNumber}`);

    // Step 2: Get bank account and customer from banking database
    const { data: bankAccount, error: bankError } = await bankingDb
      .from('bank_accounts')
      .select(`
        account_id,
        account_number,
        bank_name,
        account_type,
        balance,
        status,
        customer_id,
        customers!inner (
          customer_id,
          full_name,
          email,
          phone,
          credit_score
        )
      `)
      .eq('account_number', linkedAccountNumber)
      .single();

    if (bankError || !bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found in banking database',
        error: bankError?.message
      });
    }

    console.log(`Found bank account: ${bankAccount.account_number} for customer: ${bankAccount.customers.full_name}`);

    const customer = bankAccount.customers;

    console.log(`Found customer: ${customer.full_name} (ID: ${customer.customer_id})`);

    // Step 3: If accountNumber is provided, verify it belongs to this customer
    if (accountNumber) {
      const { data: bankAccount, error: accountError } = await bankingDb
        .from('bank_accounts')
        .select('account_id, account_number, customer_id')
        .eq('account_number', accountNumber)
        .eq('customer_id', customer.customer_id)
        .single();

      if (accountError || !bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found or does not belong to this user',
          error: accountError?.message
        });
      }

      console.log(`Verified bank account: ${accountNumber}`);
    }

    // Step 4: Get all demat accounts for this customer
    const { data: dematAccounts, error: dematError } = await bankingDb
      .from('demat_accounts')
      .select('*')
      .eq('customer_id', customer.customer_id);

    if (dematError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch demat accounts',
        error: dematError.message
      });
    }

    console.log(`Found ${dematAccounts?.length || 0} demat accounts`);

    if (!dematAccounts || dematAccounts.length === 0) {
      return res.json({
        success: true,
        message: 'No demat accounts found for this user',
        data: {
          holdings: [],
          dematAccounts: [],
          summary: {
            totalHoldings: 0,
            totalValue: 0,
            totalInvestment: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0
          }
        }
      });
    }

    // Step 5: Get all holdings for these demat accounts
    const dematIds = dematAccounts.map(d => d.demat_id);
    
    const { data: holdings, error: holdingsError } = await bankingDb
      .from('holdings')
      .select('*')
      .in('demat_id', dematIds);

    if (holdingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch holdings',
        error: holdingsError.message
      });
    }

    console.log(`Found ${holdings?.length || 0} holdings`);

    // Step 6: Enrich holdings with demat account info and calculate metrics
    const enrichedHoldings = (holdings || []).map(holding => {
      const dematAccount = dematAccounts.find(d => d.demat_id === holding.demat_id);
      const investment = parseFloat(holding.bought_price || 0) * parseFloat(holding.quantity || 0);
      const currentValue = parseFloat(holding.current_price || 0) * parseFloat(holding.quantity || 0);
      const gainLoss = currentValue - investment;
      const gainLossPercent = investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        holding_id: holding.holding_id,
        demat_id: holding.demat_id,
        broker_name: dematAccount?.broker_name || 'Unknown',
        name: holding.name,
        symbol: holding.name, // Using name as symbol for now
        quantity: parseFloat(holding.quantity || 0),
        bought_price: parseFloat(holding.bought_price || 0),
        current_price: parseFloat(holding.current_price || 0),
        selling_price: holding.selling_price ? parseFloat(holding.selling_price) : null,
        selling_date: holding.selling_date,
        status: holding.status || 'active',
        investment,
        currentValue,
        gainLoss,
        gainLossPercent,
        created_at: holding.created_at
      };
    });

    // Step 7: Calculate summary metrics
    const summary = enrichedHoldings.reduce((acc, holding) => {
      acc.totalHoldings++;
      acc.totalValue += holding.currentValue;
      acc.totalInvestment += holding.investment;
      acc.totalGainLoss += holding.gainLoss;
      return acc;
    }, {
      totalHoldings: 0,
      totalValue: 0,
      totalInvestment: 0,
      totalGainLoss: 0
    });

    summary.totalGainLossPercent = summary.totalInvestment > 0 
      ? (summary.totalGainLoss / summary.totalInvestment) * 100 
      : 0;

    // Round to 2 decimal places
    Object.keys(summary).forEach(key => {
      if (typeof summary[key] === 'number' && key !== 'totalHoldings') {
        summary[key] = Math.round(summary[key] * 100) / 100;
      }
    });

    res.json({
      success: true,
      message: 'Holdings fetched successfully',
      data: {
        customer: {
          customer_id: customer.customer_id,
          full_name: customer.full_name,
          email: customer.email,
          phone: customer.phone,
          credit_score: customer.credit_score
        },
        bankAccount: {
          account_id: bankAccount.account_id,
          account_number: bankAccount.account_number,
          bank_name: bankAccount.bank_name,
          account_type: bankAccount.account_type,
          balance: parseFloat(bankAccount.balance || 0),
          status: bankAccount.status
        },
        holdings: enrichedHoldings,
        dematAccounts: dematAccounts.map(d => ({
          demat_id: d.demat_id,
          broker_name: d.broker_name,
          masked_demat: d.masked_demat,
          total_value: parseFloat(d.total_value || 0),
          last_synced: d.last_synced
        })),
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all holdings (admin/debug endpoint)
 * GET /api/holdings/all
 */
const getAllHoldings = async (req, res) => {
  try {
    const { data: holdings, error } = await bankingDb
      .from('holdings')
      .select('*')
      .order('holding_id', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch holdings',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: holdings || [],
      count: holdings?.length || 0
    });

  } catch (error) {
    console.error('Error fetching all holdings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get holdings by demat account
 * GET /api/holdings/demat/:dematId
 */
const getHoldingsByDemat = async (req, res) => {
  try {
    const { dematId } = req.params;

    const { data: holdings, error } = await bankingDb
      .from('holdings')
      .select('*')
      .eq('demat_id', dematId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch holdings',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: holdings || [],
      count: holdings?.length || 0
    });

  } catch (error) {
    console.error('Error fetching holdings by demat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get holdings by account number (direct banking DB query)
 * GET /api/holdings/account/:accountNumber
 * This bypasses the user mapping and queries directly from banking database
 */
const getHoldingsByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { realtime } = req.query; // Optional: fetch real-time prices from NSE

    console.log(`Fetching holdings for account number: ${accountNumber}${realtime ? ' (with real-time prices)' : ''}`);

    // Step 1: Get bank account from banking database
    const { data: bankAccount, error: accountError } = await bankingDb
      .from('bank_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .single();

    if (accountError || !bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
        error: accountError?.message
      });
    }

    console.log(`Found bank account: ${bankAccount.account_number} (${bankAccount.bank_name})`);

    // Step 2: Get customer from banking database
    const { data: customer, error: customerError } = await bankingDb
      .from('customers')
      .select('*')
      .eq('customer_id', bankAccount.customer_id)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        error: customerError?.message
      });
    }

    console.log(`Found customer: ${customer.full_name} (ID: ${customer.customer_id})`);

    // Step 3: Get all demat accounts for this customer
    const { data: dematAccounts, error: dematError } = await bankingDb
      .from('demat_accounts')
      .select('*')
      .eq('customer_id', customer.customer_id);

    if (dematError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch demat accounts',
        error: dematError.message
      });
    }

    console.log(`Found ${dematAccounts?.length || 0} demat accounts`);

    if (!dematAccounts || dematAccounts.length === 0) {
      return res.json({
        success: true,
        message: 'No demat accounts found for this customer',
        data: {
          customer: {
            customer_id: customer.customer_id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
          },
          bankAccount: {
            account_number: bankAccount.account_number,
            bank_name: bankAccount.bank_name,
            balance: parseFloat(bankAccount.balance || 0)
          },
          holdings: [],
          dematAccounts: [],
          summary: {
            totalHoldings: 0,
            totalValue: 0,
            totalInvestment: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0
          }
        }
      });
    }

    // Step 4: Get all holdings for these demat accounts
    const dematIds = dematAccounts.map(d => d.demat_id);
    
    const { data: holdings, error: holdingsError } = await bankingDb
      .from('holdings')
      .select('*')
      .in('demat_id', dematIds);

    if (holdingsError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch holdings',
        error: holdingsError.message
      });
    }

    console.log(`Found ${holdings?.length || 0} holdings`);

    // Step 5: Fetch real-time prices if requested
    let realTimePrices = {};
    if (realtime === 'true' && holdings && holdings.length > 0) {
      console.log('Fetching real-time prices from NSE India...');
      
      // Extract symbols from holding names
      const symbols = holdings.map(h => extractSymbol(h.name)).filter(Boolean);
      
      if (symbols.length > 0) {
        realTimePrices = await fetchMultipleStockPrices(symbols);
        console.log(`Fetched real-time prices for ${Object.keys(realTimePrices).length} stocks`);
      }
    }

    // Step 6: Enrich holdings with demat account info and calculate metrics
    const enrichedHoldings = (holdings || []).map(holding => {
      const dematAccount = dematAccounts.find(d => d.demat_id === holding.demat_id);
      const symbol = extractSymbol(holding.name);
      
      // Use real-time price if available, otherwise use stored price
      let currentPrice = parseFloat(holding.current_price || 0);
      let priceSource = 'database';
      let realTimeData = null;
      
      if (realtime === 'true' && symbol && realTimePrices[symbol]) {
        const rtPrice = realTimePrices[symbol];
        if (rtPrice.success && rtPrice.lastPrice) {
          currentPrice = rtPrice.lastPrice;
          priceSource = 'NSE India (Live)';
          realTimeData = {
            lastPrice: rtPrice.lastPrice,
            change: rtPrice.change,
            pChange: rtPrice.pChange,
            previousClose: rtPrice.previousClose,
            high: rtPrice.high,
            low: rtPrice.low,
            lastUpdated: rtPrice.lastUpdated
          };
        }
      }

      const boughtPrice = parseFloat(holding.bought_price || 0);
      const quantity = parseFloat(holding.quantity || 0);
      const investment = boughtPrice * quantity;
      const currentValue = currentPrice * quantity;
      const gainLoss = currentValue - investment;
      const gainLossPercent = investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        holding_id: holding.holding_id,
        demat_id: holding.demat_id,
        broker_name: dematAccount?.broker_name || 'Unknown',
        name: holding.name,
        symbol: symbol || holding.name,
        quantity,
        bought_price: boughtPrice,
        current_price: currentPrice,
        price_source: priceSource,
        real_time_data: realTimeData,
        selling_price: holding.selling_price ? parseFloat(holding.selling_price) : null,
        selling_date: holding.selling_date,
        status: holding.status || 'active',
        investment,
        currentValue,
        gainLoss,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
        created_at: holding.created_at
      };
    });

    // Step 7: Calculate summary metrics
    const summary = enrichedHoldings.reduce((acc, holding) => {
      acc.totalHoldings++;
      acc.totalValue += holding.currentValue;
      acc.totalInvestment += holding.investment;
      acc.totalGainLoss += holding.gainLoss;
      return acc;
    }, {
      totalHoldings: 0,
      totalValue: 0,
      totalInvestment: 0,
      totalGainLoss: 0
    });

    summary.totalGainLossPercent = summary.totalInvestment > 0 
      ? (summary.totalGainLoss / summary.totalInvestment) * 100 
      : 0;

    // Round to 2 decimal places
    Object.keys(summary).forEach(key => {
      if (typeof summary[key] === 'number' && key !== 'totalHoldings') {
        summary[key] = Math.round(summary[key] * 100) / 100;
      }
    });

    res.json({
      success: true,
      message: 'Holdings fetched successfully',
      realtime: realtime === 'true',
      data: {
        customer: {
          customer_id: customer.customer_id,
          full_name: customer.full_name,
          email: customer.email,
          phone: customer.phone,
          credit_score: parseFloat(customer.credit_score || 0)
        },
        bankAccount: {
          account_id: bankAccount.account_id,
          account_number: bankAccount.account_number,
          bank_name: bankAccount.bank_name,
          account_type: bankAccount.account_type,
          balance: parseFloat(bankAccount.balance || 0),
          status: bankAccount.status
        },
        holdings: enrichedHoldings,
        dematAccounts: dematAccounts.map(d => ({
          demat_id: d.demat_id,
          broker_name: d.broker_name,
          masked_demat: d.masked_demat,
          total_value: parseFloat(d.total_value || 0),
          last_synced: d.last_synced
        })),
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching holdings by account number:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserHoldings,
  getAllHoldings,
  getHoldingsByDemat,
  getHoldingsByAccountNumber
};
