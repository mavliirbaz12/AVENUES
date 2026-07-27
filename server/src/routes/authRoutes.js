import express from 'express';
import {
  loginUser,
  registerUser,
  createAdmin,
  verifyEmail,
  sendVerification,
  resendVerification,
  getMe,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/create-admin', createAdmin);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-verification', sendVerification);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);

export default router;
