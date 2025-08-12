import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = Router();

router.get('/', protect, authorize('admin'), listCoupons);
router.get('/validate', validateCoupon);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router; 