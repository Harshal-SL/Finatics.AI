const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/transactions/payment-intent
 * @desc    Create a payment intent for EMI, loan, or subscription
 * @access  Private
 */
router.post('/payment-intent', authenticate, transactionController.createPaymentIntent);

/**
 * @route   POST /api/transactions/subscription
 * @desc    Create a subscription
 * @access  Private
 */
router.post('/subscription', authenticate, transactionController.createSubscription);

/**
 * @route   GET /api/transactions/confirm/:paymentIntentId
 * @desc    Confirm payment status
 * @access  Private
 */
router.get('/confirm/:paymentIntentId', authenticate, transactionController.confirmPayment);

/**
 * @route   GET /api/transactions/history
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/history', authenticate, transactionController.getTransactionHistory);

/**
 * @route   GET /api/transactions/subscriptions
 * @desc    Get active subscriptions
 * @access  Private
 */
router.get('/subscriptions', authenticate, transactionController.getActiveSubscriptions);

/**
 * @route   DELETE /api/transactions/subscription/:subscriptionId
 * @desc    Cancel subscription
 * @access  Private
 */
router.delete('/subscription/:subscriptionId', authenticate, transactionController.cancelSubscription);

/**
 * @route   POST /api/transactions/webhook
 * @desc    Stripe webhook handler
 * @access  Public
 */
router.post('/webhook', express.raw({ type: 'application/json' }), transactionController.handleWebhook);

module.exports = router;
