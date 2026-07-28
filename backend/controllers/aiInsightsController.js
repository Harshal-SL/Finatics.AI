const { getMarketInsights } = require('../services/ai/geminiService');

/**
 * Get AI-powered market insights
 * GET /api/ai-insights
 */
const getAIInsights = async (req, res, next) => {
  try {
    const insights = await getMarketInsights();

    res.json({
      success: true,
      message: insights.fallback 
        ? 'AI insights generated (using fallback data)' 
        : 'AI insights generated successfully',
      data: {
        weekEnding: insights.weekEnding,
        marketSummary: insights.marketSummary,
        insights: insights.insights,
        generatedAt: insights.generatedAt,
        timestamp: insights.timestamp,
        isFallback: insights.fallback || false
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIInsights
};
