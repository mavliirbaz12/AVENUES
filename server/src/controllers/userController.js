import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const setTokenCookie = (res, token) => {
  res.cookie('avenues_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    const updated = await user.save();
    res.json({ _id: updated._id, firstName: updated.firstName, lastName: updated.lastName, email: updated.email, phone: updated.phone, role: updated.role, addresses: updated.addresses, avatarUrl: updated.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Please provide both current and new password' });
    if (!(await bcrypt.compare(oldPassword, user.password))) return res.status(401).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name slug images color')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems, shippingAddress, paymentMethod, paymentResult,
      taxPrice, shippingPrice, couponCode, discountType, discountValue, discount, totalPrice,
      deliveryInstructions, whatsappUpdates,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product).select('stock quantity name');
      if (!product) return res.status(400).json({ message: `Product not found: ${item.name}` });
      if (product.stock.quantity < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock.quantity}` });
      product.stock.quantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult || {},
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      couponCode: couponCode || '',
      discountType: discountType || '',
      discountValue: discountValue || 0,
      discount: discount || 0,
      totalPrice,
      deliveryInstructions: deliveryInstructions || '',
      whatsappUpdates: whatsappUpdates !== false,
      status: paymentMethod === 'cod' ? 'placed' : 'placed',
      isPaid: paymentMethod !== 'cod',
      paidAt: paymentMethod !== 'cod' ? Date.now() : undefined,
      timeline: [
        { status: 'placed', timestamp: new Date(), description: 'Order placed successfully' },
      ],
    });

    if (couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wishlist').populate('wishlist', 'name slug images color pricing sellingPrice rating reviewCount');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const exists = user.wishlist.some((id) => id.toString() === productId);
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    const populated = await User.findById(req.user._id).select('wishlist').populate('wishlist', 'name slug images color pricing sellingPrice rating reviewCount');
    res.json({ wishlist: populated.wishlist, added: !exists });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const reorderOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product', 'name slug images color pricing sellingPrice');
    if (!order || order.user.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Order not found' });
    const items = order.orderItems.map(item => ({ ...item, price: item.product?.pricing?.sellingPrice || item.price }));
    res.json({ items, message: 'Reorder data fetched' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
