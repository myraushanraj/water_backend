import { env } from '../../config/env.js';
import { StripeService } from './stripeService.js';
import { RazorpayService } from './razorpayService.js';

class PaymentServiceFacade {
  constructor() {
    this.provider = env.paymentProvider;
    if (this.provider === 'stripe') this.impl = new StripeService();
    else if (this.provider === 'razorpay') this.impl = new RazorpayService();
    else this.impl = null;
  }

  async createPayment(params) {
    if (!this.impl) return { provider: 'none', ...params, referenceId: undefined, metadata: {} };
    return this.impl.createPayment(params);
  }

  async verifySignature(req) {
    if (!this.impl?.verifySignature) return { success: true };
    return this.impl.verifySignature(req);
  }

  async refundPayment({ order }) {
    if (!this.impl?.refundPayment) return { success: false, message: 'Refund not supported' };
    return this.impl.refundPayment({ order });
  }
}

export const paymentService = new PaymentServiceFacade(); 