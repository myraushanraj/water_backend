import { Router } from 'express';
import { 
  createBulkOrder, 
  getMyBulkOrders, 
  getAllBulkOrders, 
  getBulkOrderById, 
  updateBulkOrderStatus, 
  deleteBulkOrder 
} from '../controllers/bulkOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/', createBulkOrder);
router.get('/my', getMyBulkOrders);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBulkOrders);
router.get('/:id', protect, authorize('admin'), getBulkOrderById);
router.put('/:id/status', protect, authorize('admin'), updateBulkOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteBulkOrder);

export default router; 