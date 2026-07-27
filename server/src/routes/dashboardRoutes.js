import express from 'express';
import {
  getDashboardStats, getSalesTrend, getTopProducts,
  getOrderStatus, getRecentOrders, getAnalytics,
} from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/sales-trend', protect, admin, getSalesTrend);
router.get('/top-products', protect, admin, getTopProducts);
router.get('/order-status', protect, admin, getOrderStatus);
router.get('/recent-orders', protect, admin, getRecentOrders);
router.get('/analytics', protect, admin, getAnalytics);

export default router;
