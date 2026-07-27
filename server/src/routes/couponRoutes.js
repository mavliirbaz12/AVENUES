import express from 'express';
import {
  getCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon,
  validateCoupon, getAutoApplyCoupons,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes (protected)
router.post('/validate', protect, validateCoupon);
router.post('/auto-apply', protect, getAutoApplyCoupons);

// Admin routes
router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id')
  .get(protect, admin, getCoupon)
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
