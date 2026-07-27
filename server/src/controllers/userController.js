import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get all customers (non-admin users)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      addresses: updated.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
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

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
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

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
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

// @desc    Get user orders
// @route   GET /api/users/orders
export const getUserOrders = async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name slug images color')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create order
// @route   POST /api/users/orders
export const createOrder = async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
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
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock.quantity}` });
      }
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

    // Increment coupon usage count
    if (couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wishlist').populate('wishlist', 'name slug images color pricing sellingPrice rating reviewCount');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/toggle
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
    const populated = await User.findById(req.user._id)
      .select('wishlist')
      .populate('wishlist', 'name slug images color pricing sellingPrice rating reviewCount');

    res.json({ wishlist: populated.wishlist, added: !exists });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
