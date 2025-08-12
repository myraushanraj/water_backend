import { Router } from 'express';
import { paymentService } from '../services/payment/paymentService.js';

const router = Router();

router.post('/payments', async (req, res) => {
  const verified = await paymentService.verifySignature(req);
  if (!verified.success) return res.status(400).json({ success: false });
  return res.json({ success: true });
});

export default router; 