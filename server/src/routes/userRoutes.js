import express from 'express';
import {
  getUsers, deleteUser, getUserProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  getUserOrders, createOrder, getWishlist, toggleWishlist,
  changePassword, uploadAvatar, reorderOrder,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import { addressValidation } from '../middleware/validate.js';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, uploadAvatar);

router.route('/addresses').post(protect, addressValidation, addAddress);
router.route('/addresses/:addressId').put(protect, addressValidation, updateAddress).delete(protect, deleteAddress);

router.route('/orders').get(protect, getUserOrders).post(protect, createOrder);
router.route('/orders/:id/reorder').get(protect, reorderOrder);
router.route('/orders/:id/invoice').get(protect, async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    res.setHeader('Content-Type', 'application/json');
    res.json({ invoice: { number: order.orderNumber, date: order.createdAt, customer: order.shippingAddress.fullName, email: order.shippingAddress.email || req.user.email, items: order.orderItems, subtotal: order.totalPrice - order.taxPrice - order.shippingPrice - (order.discount || 0), tax: order.taxPrice, shipping: order.shippingPrice, discount: order.discount, total: order.totalPrice, paymentMethod: order.paymentMethod } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/toggle').post(protect, toggleWishlist);

router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;
