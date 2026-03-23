const express = require('express');
const router = express.Router();
const goalAnalyzerController = require('../controllers/goalAnalyzerController');

/**
 * Goal Analyzer Routes
 * GET /api/goals?userId=xxx - Get user's goals from database
 * POST /api/goals - Analyze financial goal with AI and optionally save to database
 * PUT /api/goals/:goalId - Update goal progress
 * DELETE /api/goals/:goalId - Delete a goal
 */
router.get('/', goalAnalyzerController.getUserGoals);
router.post('/', goalAnalyzerController.analyzeGoal);
router.put('/:goalId', goalAnalyzerController.updateGoal);
router.delete('/:goalId', goalAnalyzerController.deleteGoal);

module.exports = router;
