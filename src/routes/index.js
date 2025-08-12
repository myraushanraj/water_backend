import { Router } from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import orderRoutes from './orders.js';
import adminRoutes from './admin.js';
import webhookRoutes from './webhooks.js';
import couponRoutes from './coupons.js';
import uploadRoutes from './upload.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/coupons', couponRoutes);
router.use('/upload', uploadRoutes);

export default router; 