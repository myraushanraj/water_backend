import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env.js';

export class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
    this.provider = 'razorpay';
  }

  async createPayment({ orderId, amount, currency = 'INR' }) {
    const order = await this.razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt: orderId, notes: { orderId } });
    return { provider: 'razorpay', referenceId: order.id, metadata: order };
  }

  verifySignature(req) {
    const signature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', env.razorpayKeySecret).update(payload).digest('hex');
    const success = signature === expected;
    return { success };
  }

  async refundPayment({ order }) {
    // For simplicity, no direct refund via order. In real flow, capture payment_id from webhook/payment success and refund it.
    return { success: false, message: 'Implement Razorpay refund with payment_id' };
  }
} 