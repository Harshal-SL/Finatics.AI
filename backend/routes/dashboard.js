const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { validateBankAccount, validateDashboardQuery } = require('../middlewares/errorMiddleware');

/**
 * Dashboard Routes
 * Defines API endpoints for dashboard operations with validation middleware
 */

// POST /api/dashboard - Add Bank Account (with smart dashboard data retrieval)
router.post('/', validateBankAccount, dashboardController.addBankAccount);

// GET /api/dashboard - Fetch Complete Dashboard Data
router.get('/', validateDashboardQuery, dashboardController.getDashboardData);

module.exports = router;