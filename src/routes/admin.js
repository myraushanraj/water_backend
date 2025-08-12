import { Router } from 'express';
import { dashboardStats, listCustomers, setCustomerActive } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/dashboard', dashboardStats);
router.get('/customers', listCustomers);
router.put('/customers/:id/active', setCustomerActive);

export default router; 