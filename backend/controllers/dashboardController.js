const dashboardService = require('../services/dashboardService');

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard operations including account management
 * and financial data retrieval. Acts as the interface between routes and services.
 */
const dashboardController = {
  /**
   * POST /api/dashboard - Add Bank Account
   * Smart account addition with conditional dashboard data retrieval
   */
  addBankAccount: async (req, res) => {
    try {
      const { accountNumber, bankName, accountType, userId } = req.body;

      // Basic validation (middleware handles detailed validation)
      if (!accountNumber || !bankName || !accountType || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: accountNumber, bankName, accountType, userId'
        });
      }

      // Process account addition through service layer
      const result = await dashboardService.addBankAccount({
        accountNumber,
        bankName,
        accountType,
        userId
      });

      // Build response with conditional dashboard data
      const responseData = {
        accountAdded: result.newAccount,
        isFirstAccount: result.isFirstAccount,
        totalAccounts: result.totalAccounts
      };

      // Include comprehensive dashboard data for additional accounts
      if (!result.isFirstAccount && result.dashboardData) {
        responseData.dashboardData = result.dashboardData;
      }

      const message = result.isFirstAccount 
        ? 'First bank account added successfully' 
        : `Additional bank account added successfully. You now have ${result.totalAccounts} linked accounts.`;

      res.status(201).json({
        success: true,
        message,
        data: responseData
      });

    } catch (error) {
      console.error('Error in addBankAccount controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bank account',
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard - Fetch Dashboard Data with Specific Metrics
   * Retrieves account_balance, monthly_expenses, monthly_savings, recent_transactions
   * Based on user's linked accounts from Application DB and financial data from Banking DB
   */
  getDashboardData: async (req, res) => {
    try {
      const { userId, user_id } = req.query;

      // Support both userId (camelCase) and user_id (snake_case) for flexibility
      const userIdParam = userId || user_id;

      // Parameter validation
      if (!userIdParam) {
        return res.status(400).json({
          success: false,
          message: 'userId query parameter is required',
          example: 'GET /api/dashboard?userId=2b06a9d7-a452-45a4-a31e-38e7c411c7ab'
        });
      }

      // Validate userId format (basic UUID check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userIdParam)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format. Must be a valid UUID.'
        });
      }

      // Fetch dashboard data using the new endpoint-specific service
      const dashboardData = await dashboardService.getDashboardDataForEndpoint(userIdParam);

      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData
      });

    } catch (error) {
      console.error('Error in getDashboardData controller:', error);
      
      // Handle specific error cases
      if (error.message.includes('No linked bank accounts')) {
        return res.status(404).json({
          success: false,
          message: 'No linked bank accounts found for this user',
          data: {
            account_balance: 0,
            monthly_expenses: 0,
            monthly_savings: 0,
            monthly_savings_summary: {
              income: 0,
              expenses: 0,
              savings: 0,
              savings_rate: 0
            },
            recent_transactions: [],
            linked_accounts_count: 0
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }
};

module.exports = dashboardController;