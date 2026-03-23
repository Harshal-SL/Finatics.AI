const investmentService = require('../services/investmentService');

/**
 * Get comprehensive investment data (stocks, mutual funds, fixed deposits)
 */
const getInvestments = async (req, res) => {
  try {
    const userId = req.query.userId || req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format. Must be a valid UUID'
      });
    }

    const investmentData = await investmentService.getInvestmentsData(userId);

    return res.json({
      success: true,
      message: 'Investment data retrieved successfully',
      data: investmentData
    });

  } catch (error) {
    console.error('Investment controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment data',
      error: error.message
    });
  }
};

module.exports = {
  getInvestments
};
