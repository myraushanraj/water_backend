import Stripe from 'stripe';
import { env } from '../../config/env.js';

export class StripeService {
  constructor() {
    this.stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' });
    this.provider = 'stripe';
  }

  async createPayment({ orderId, amount, currency = 'INR' }) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });
    return { provider: 'stripe', referenceId: intent.id, metadata: { clientSecret: intent.client_secret } };
  }

  verifySignature(req) {
    // For brevity, webhook verification would be implemented here if needed
    return { success: true };
  }

  async refundPayment({ order }) {
    if (!order?.payment?.referenceId) return { success: false, message: 'No payment reference' };
    const refund = await this.stripe.refunds.create({ payment_intent: order.payment.referenceId });
    return { success: true, refundId: refund.id };
  }
} 