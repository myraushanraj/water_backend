import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, me, requestOtp, verifyOtp, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], register);
router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 })], login);
router.post('/logout', logout);
router.get('/me', protect, me);

router.post('/otp/request', [body('email').isEmail()], requestOtp);
router.post('/otp/verify', [body('email').isEmail(), body('otp').isLength({ min: 4 })], verifyOtp);

router.post('/forgot-password', [body('email').isEmail()], forgotPassword);
router.post('/reset-password', [body('email').isEmail(), body('token').notEmpty(), body('password').isLength({ min: 6 })], resetPassword);

export default router; 