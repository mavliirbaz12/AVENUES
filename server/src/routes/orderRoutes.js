import express from 'express';
import { getOrders, getOrderById, updateOrderStatus, getOrderTracking } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, admin, getOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/tracking').get(protect, getOrderTracking);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
