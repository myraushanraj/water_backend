import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { handleUpload } from '../controllers/uploadController.js';

const router = Router();

router.post('/image', protect, authorize('admin'), uploadImage.single('file'), handleUpload);

export default router; 