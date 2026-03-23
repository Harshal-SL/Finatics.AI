// const stripeService = require('../services/stripeService'); // Disabled - Using PayPal instead

class TransactionController {
  /**
   * Create a payment intent for a transaction
   */
  async createPaymentIntent(req, res, next) {
    try {
      const { amount, type, description, metadata } = req.body;
      const userId = req.user?.id; // Assuming authentication middleware sets req.user

      if (!amount || !type) {
        return res.status(400).json({
          success: false,
          error: 'Amount and type are required',
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await stripeService.processPayment({
        userId,
        amount,
        type,
        description: description || `${type} payment`,
        metadata: metadata || {},
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(req, res, next) {
    try {
      const { priceId, metadata } = req.body;
      const userId = req.user?.id;
      const email = req.user?.email;

      if (!priceId) {
        return res.status(400).json({
          success: false,
          error: 'Price ID is required',
        });
      }

      if (!userId || !email) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await stripeService.createSubscription({
        userId,
        priceId,
        email,
        metadata: metadata || {},
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment status
   */
  async confirmPayment(req, res, next) {
    try {
      const { paymentIntentId } = req.params;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      const result = await stripeService.confirmPayment(paymentIntentId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user?.id;
      const { limit, offset } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await stripeService.getTransactionHistory(userId, {
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active subscriptions
   */
  async getActiveSubscriptions(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await stripeService.getActiveSubscriptions(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req, res, next) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({
          success: false,
          error: 'Subscription ID is required',
        });
      }

      const result = await stripeService.cancelSubscription(subscriptionId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook handler for Stripe events
   */
  async handleWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn('Stripe webhook secret not configured');
        return res.status(400).json({
          success: false,
          error: 'Webhook not configured',
        });
      }

      const stripe = require('../config/stripe');
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await stripeService.confirmPayment(paymentIntent.id);
          break;
        case 'payment_intent.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Handle subscription changes
          console.log('Subscription updated:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
