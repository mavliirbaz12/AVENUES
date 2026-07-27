import express from 'express';
import {
  getUsers, deleteUser, getUserProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  getUserOrders, createOrder, getWishlist, toggleWishlist
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Profile
router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);

// Addresses
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:addressId').put(protect, updateAddress).delete(protect, deleteAddress);

// Orders
router.route('/orders').get(protect, getUserOrders).post(protect, createOrder);

// Wishlist
router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/toggle').post(protect, toggleWishlist);

// Admin
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;
