const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateUserPin,
  getLinkedAccounts,
  linkBankAccount
} = require('../controllers/userController');

/**
 * User Profile Routes
 * All routes expect userId as parameter
 */

// Get user profile
router.get('/:userId/profile', getUserProfile);

// Update user profile
router.put('/:userId/profile', updateUserProfile);

// Update user PIN
router.put('/:userId/pin', updateUserPin);

// Get linked bank accounts
router.get('/:userId/linked-accounts', getLinkedAccounts);

// Link a bank account
router.post('/:userId/linked-accounts', linkBankAccount);

module.exports = router;