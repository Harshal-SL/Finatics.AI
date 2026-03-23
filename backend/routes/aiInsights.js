const express = require('express');
const router = express.Router();
const { getAIInsights } = require('../controllers/aiInsightsController');

/**
 * @route   GET /api/ai-insights
 * @desc    Get AI-powered market insights from Gemini
 * @access  Public
 */
router.get('/', getAIInsights);

module.exports = router;
