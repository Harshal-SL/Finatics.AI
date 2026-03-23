const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

/**
 * @route   GET /api/investments
 * @desc    Get comprehensive investment data (stocks, mutual funds, fixed deposits)
 * @access  Public (should be protected in production)
 * @query   userId - User ID (UUID format)
 * @returns {Object} Investment breakdown with totals and individual holdings
 */
router.get('/', investmentController.getInvestments);

/**
 * @route   GET /api/investments/by-account
 * @desc    Get investment data directly by account number (workaround for UUID issue)
 * @access  Public
 * @query   accountNumber - Account number
 */
router.get('/by-account', async (req, res) => {
  try {
    const { bankingDb } = require('../config/supabase');
    const accountNumber = req.query.accountNumber;
    
    if (!accountNumber) {
      return res.status(400).json({ success: false, message: 'accountNumber is required' });
    }
    
    // Get account from banking DB directly
    const { data: accountData } = await bankingDb
      .from('bank_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .single();
    
    if (!accountData) {
      return res.json({
        success: true,
        message: 'Account not found',
        data: {
          totalInvestments: 0,
          stocks: { totalValue: 0, holdings: [], count: 0 },
          mutualFunds: { totalValue: 0, funds: [], count: 0 },
          fixedDeposits: { totalValue: 0, deposits: [], count: 0 },
          breakdown: { stocks: 0, mutualFunds: 0, fixedDeposits: 0 }
        }
      });
    }
    
    const customerId = accountData.customer_id;
    
    // Fetch all investment data
    const [dematData, mutualFundsData, fixedDepositsData] = await Promise.all([
      bankingDb.from('demat_accounts').select('*').eq('customer_id', customerId),
      bankingDb.from('mutual_funds').select('*').eq('customer_id', customerId),
      bankingDb.from('fixed_deposits').select('*').eq('customer_id', customerId).eq('account_id', accountData.account_id)
    ]);
    
    // Get stock holdings
    const dematIds = dematData.data?.map(d => d.demat_id) || [];
    const { data: holdings } = dematIds.length > 0 
      ? await bankingDb.from('holdings').select('*').in('demat_id', dematIds)
      : { data: [] };
    
    // Calculate totals
    const stocksTotal = holdings?.reduce((sum, h) => sum + (h.quantity * h.current_price), 0) || 0;
    const mfTotal = mutualFundsData.data?.reduce((sum, mf) => sum + parseFloat(mf.current_value || 0), 0) || 0;
    const fdTotal = fixedDepositsData.data?.reduce((sum, fd) => sum + parseFloat(fd.deposit_amount || 0), 0) || 0;
    const totalInvestments = stocksTotal + mfTotal + fdTotal;
    
    res.json({
      success: true,
      message: 'Investment data retrieved successfully',
      data: {
        totalInvestments,
        stocks: {
          totalValue: stocksTotal,
          holdings: holdings || [],
          count: holdings?.length || 0
        },
        mutualFunds: {
          totalValue: mfTotal,
          funds: mutualFundsData.data || [],
          count: mutualFundsData.data?.length || 0
        },
        fixedDeposits: {
          totalValue: fdTotal,
          deposits: fixedDepositsData.data || [],
          count: fixedDepositsData.data?.length || 0
        },
        breakdown: {
          stocks: stocksTotal,
          mutualFunds: mfTotal,
          fixedDeposits: fdTotal
        },
        percentageBreakdown: totalInvestments > 0 ? {
          stocks: ((stocksTotal / totalInvestments) * 100).toFixed(2),
          mutualFunds: ((mfTotal / totalInvestments) * 100).toFixed(2),
          fixedDeposits: ((fdTotal / totalInvestments) * 100).toFixed(2)
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
