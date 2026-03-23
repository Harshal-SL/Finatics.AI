/**
 * Chatbot Controller
 * Handles AI chatbot interactions using Gemini API
 */

const { getChatbotResponse, isFinanceQuery } = require('../services/ai/chatbotService');
const { appDb } = require('../config/supabase');
const dashboardService = require('../services/dashboardService');

/**
 * Process chatbot query
 * POST /api/chatbot/query
 * Body: { userId, query }
 */
const processChatQuery = async (req, res, next) => {
  try {
    const { userId, query } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      });
    }

    // Check if query is finance-related
    if (!isFinanceQuery(query)) {
      return res.json({
        success: true,
        response: 'Finance queries only, please. I can help with stocks, mutual funds, tax, budgeting, and other financial topics.',
        metadata: {
          timestamp: new Date().toISOString(),
          queryType: 'non-finance'
        }
      });
    }

    // Get user financial data from dashboard service (calculates from transactions)
    let userData = {
      savings: 50000,  // Default: ₹50,000
      expenses: 30000,  // Default: ₹30,000
      accountBalance: 0,
      monthlyIncome: 0
    };

    try {
      const dashboardData = await dashboardService.getDashboardDataForEndpoint(userId);
      
      // Calculate total savings as account balance (primary indicator of user's total savings)
      const accountBalance = dashboardData.account_balance || 0;
      const monthlyExpenses = dashboardData.monthly_expenses || 0;
      const monthlyIncome = dashboardData.monthly_savings_summary?.income || 0;
      
      userData = {
        savings: accountBalance,  // Use account balance as total savings
        expenses: monthlyExpenses,  // Monthly expenses
        accountBalance: accountBalance,
        monthlyIncome: monthlyIncome
      };
      
      console.log('User financial data loaded:', {
        accountBalance,
        monthlyExpenses,
        monthlyIncome,
        surplus: accountBalance - monthlyExpenses
      });
    } catch (dashError) {
      console.warn('Using default financial data, dashboard error:', dashError.message);
      // Continue with default values
    }

    // Get AI response from Gemini
    const aiResponse = await getChatbotResponse(query, userData);

    // Return response
    res.json({
      success: true,
      response: aiResponse,
      metadata: {
        timestamp: new Date().toISOString(),
        userData: {
          savings: userData.savings,
          expenses: userData.expenses,
          surplus: userData.savings - userData.expenses
        },
        queryType: 'finance'
      }
    });

  } catch (error) {
    console.error('Error in chatbot query:', error);
    next(error);
  }
};

/**
 * Get chatbot health status
 * GET /api/chatbot/health
 */
const getChatbotHealth = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_CHATBOT_API_KEY;
    
    res.json({
      success: true,
      status: 'operational',
      configured: !!apiKey,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking chatbot health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check chatbot health'
    });
  }
};

module.exports = {
  processChatQuery,
  getChatbotHealth
};
