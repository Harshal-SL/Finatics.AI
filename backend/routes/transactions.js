const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/payment-intent',                authenticate, transactionController.createPaymentIntent);
router.post('/subscription',                  authenticate, transactionController.createSubscription);
router.get('/confirm/:paymentIntentId',       authenticate, transactionController.confirmPayment);
router.get('/history',                        authenticate, transactionController.getTransactionHistory);
router.get('/subscriptions',                  authenticate, transactionController.getActiveSubscriptions);
router.delete('/subscription/:subscriptionId',authenticate, transactionController.cancelSubscription);
router.post('/webhook', express.raw({ type: 'application/json' }), transactionController.handleWebhook);

module.exports = router;
