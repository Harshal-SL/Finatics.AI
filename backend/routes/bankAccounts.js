const express = require('express');
const router = express.Router();
const {
  addBankAccount,
  getBankAccounts,
  removeBankAccount
} = require('../controllers/bankAccountController');

/**
 * Bank Account Routes
 * Handles adding, retrieving, and removing bank accounts
 */

// Add a new bank account
router.post('/add-account', addBankAccount);

// Get user's bank accounts
router.get('/bank-accounts/:userId', getBankAccounts);

// Remove bank account
router.delete('/bank-accounts/:linkId', removeBankAccount);

module.exports = router;