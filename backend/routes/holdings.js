const express = require('express');
const router = express.Router();
const {
  getUserHoldings,
  getAllHoldings,
  getHoldingsByDemat,
  getHoldingsByAccountNumber
} = require('../controllers/holdingsController');

/**
 * Holdings Routes
 * Base path: /api/holdings
 */

// Get holdings by account number (direct query, recommended)
router.get('/account/:accountNumber', getHoldingsByAccountNumber);

// Get user's holdings by user_id
// Optional query param: ?accountNumber=xxx
router.get('/user/:userId', getUserHoldings);

// Get all holdings (admin/debug)
router.get('/all', getAllHoldings);

// Get holdings by demat account
router.get('/demat/:dematId', getHoldingsByDemat);

module.exports = router;
