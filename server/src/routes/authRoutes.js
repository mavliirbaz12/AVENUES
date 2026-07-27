import express from 'express';
import {
  loginUser,
  registerUser,
  createAdmin,
  verifyEmail,
  sendVerification,
  resendVerification,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginValidation, registerValidation, forgotPasswordValidation, changePasswordValidation } from '../middleware/validate.js';

const router = express.Router();

router.post('/login', loginValidation, loginUser);
router.post('/register', registerValidation, registerUser);
router.post('/create-admin', createAdmin);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-verification', sendVerification);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePasswordValidation, changePassword);

export default router;
