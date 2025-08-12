import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, adminRefundOrder } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);

router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.post('/:id/refund', protect, authorize('admin'), adminRefundOrder);

export default router; 