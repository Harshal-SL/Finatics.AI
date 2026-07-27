/**
 * TransactionController
 * Payment processing has been removed (Stripe was unused).
 * These endpoints return 501 until a payment provider is integrated.
 */

class TransactionController {
  _notImplemented(res) {
    return res.status(501).json({
      success: false,
      error: 'Payment processing is not configured.',
    });
  }

  async createPaymentIntent(req, res) { return this._notImplemented(res); }
  async createSubscription(req, res)  { return this._notImplemented(res); }
  async confirmPayment(req, res)      { return this._notImplemented(res); }
  async getTransactionHistory(req, res) { return this._notImplemented(res); }
  async getActiveSubscriptions(req, res) { return this._notImplemented(res); }
  async cancelSubscription(req, res)  { return this._notImplemented(res); }
  async handleWebhook(req, res)       { return this._notImplemented(res); }
}

module.exports = new TransactionController();
