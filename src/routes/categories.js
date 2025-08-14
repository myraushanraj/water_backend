import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory, adminListCategories } from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', listCategories);
router.get('/admin', protect, authorize('admin'), adminListCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router; 