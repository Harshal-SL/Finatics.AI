const { analyzeLoanWithGemini, getUserLoanMetrics } = require('../services/loanAnalyzerService');

const loanAnalyzerController = {
  getMetrics: async (req, res) => {
    try {
      const { userId, user_id } = req.query;
      const id = userId || user_id;
      if (!id) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }
      const metrics = await getUserLoanMetrics(id);
      return res.status(200).json({ success: true, message: 'Metrics retrieved', data: metrics });
    } catch (error) {
      console.error('Loan metrics error:', error);
      return res.status(500).json({ success: false, message: 'Failed to get metrics', error: error.message });
    }
  },
  analyze: async (req, res) => {
    try {
      const { userId, loanAmount, loanType } = req.body;
      if (!userId || !loanAmount) {
        return res.status(400).json({
          success: false,
          message: 'userId and loanAmount are required'
        });
      }

      // Validate loan type if provided
      const validLoanTypes = ['Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan'];
      const selectedLoanType = loanType || 'Personal Loan'; // Default to Personal Loan
      
      if (!validLoanTypes.includes(selectedLoanType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid loan type. Must be one of: ${validLoanTypes.join(', ')}`
        });
      }

      const result = await analyzeLoanWithGemini({ 
        userId, 
        loanAmount: Number(loanAmount),
        loanType: selectedLoanType
      });

      // Create formatted console output
      const formattedOutput = `
📊 LOAN ANALYSIS SUMMARY:
======================================================================
Loan Type: ${selectedLoanType}
Credit Score: ${result.metrics.creditScore || 'N/A'}
Average Savings: ₹ ${result.metrics.avgSavings.toLocaleString('en-IN')}
Average Expenses: ₹ ${result.metrics.avgExpenses.toLocaleString('en-IN')}
Months Considered: ${result.metrics.monthsConsidered}

======================================================================
AI LOAN RECOMMENDATION:
======================================================================
${result.aiText}
`;

      // Log to console
      console.log(formattedOutput);

      return res.status(200).json({
        success: true,
        message: 'Loan analysis generated successfully',
        data: {
          loan_type: selectedLoanType,
          credit_score: result.metrics.creditScore,
          average_savings: result.metrics.avgSavings,
          average_expenses: result.metrics.avgExpenses,
          months_considered: result.metrics.monthsConsidered,
          ai_response: result.aiText,
          loan_options: result.loanOptions, // Structured loan options for card rendering
          formatted_output: formattedOutput
        }
      });
    } catch (error) {
      console.error('Loan Analyzer error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze loan request',
        error: error.message
      });
    }
  }
};

module.exports = loanAnalyzerController;
