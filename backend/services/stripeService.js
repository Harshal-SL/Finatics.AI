const stripe = require('../config/stripe');
const supabase = require('../config/supabase');

class StripeService {
  /**
   * Create a payment intent for EMI, loan, or subscription payment
   */
  async createPaymentIntent({ amount, currency = 'usd', description, metadata }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Process a one-time payment (EMI installment or loan payment)
   */
  async processPayment({ userId, amount, type, description, metadata }) {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount,
        description,
        metadata: {
          ...metadata,
          userId,
          type,
        },
      });

      // Record transaction in database
      const { data: transaction, error } = await supabase.appDb
        .from('transactions')
        .insert({
          user_id: userId,
          amount,
          type,
          status: 'pending',
          payment_intent_id: paymentIntent.paymentIntentId,
          description,
          metadata,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record transaction: ${error.message}`);
      }

      return {
        success: true,
        transaction,
        clientSecret: paymentIntent.clientSecret,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Create a subscription for recurring payments
   */
  async createSubscription({ userId, priceId, email, metadata }) {
    try {
      // Create or retrieve customer
      let customer;
      const { data: existingCustomer } = await supabase.appDb
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingCustomer) {
        customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);
      } else {
        customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });

        // Save customer ID
        await supabase.appDb
          .from('stripe_customers')
          .insert({
            user_id: userId,
            stripe_customer_id: customer.id,
          });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata,
      });

      // Record subscription in database
      const { data: subscriptionRecord, error } = await supabase.appDb
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          metadata,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: subscriptionRecord,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Confirm payment status
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update transaction status in database
      const { data: transaction, error } = await supabase.appDb
        .from('transactions')
        .update({
          status: paymentIntent.status,
          updated_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return {
        success: true,
        status: paymentIntent.status,
        transaction,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId, { limit = 50, offset = 0 } = {}) {
    try {
      const { data: transactions, error } = await supabase.appDb
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return {
        success: true,
        transactions,
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Get user's active subscriptions
   */
  async getActiveSubscriptions(userId) {
    try {
      const { data: subscriptions, error } = await supabase.appDb
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }

      return {
        success: true,
        subscriptions,
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const { data: subscription } = await supabase.appDb
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );

      // Update in database
      const { data: updatedSubscription, error } = await supabase.appDb
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return {
        success: true,
        subscription: updatedSubscription,
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
