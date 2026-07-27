import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
export const createCoupon = async (req, res) => {
  try {
    const existing = await Coupon.findOne({ code: req.body.code?.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      const existing = await Coupon.findOne({ code: req.body.code.toUpperCase(), _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ message: 'Coupon code already exists' });
      req.body.code = req.body.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Validate and apply coupon (customer)
// @route   POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body;

    if (!code) return res.status(400).json({ message: 'Please enter a coupon code' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active' });

    const now = new Date();
    if (coupon.activeFrom && now < coupon.activeFrom) return res.status(400).json({ message: 'This coupon is not yet active' });
    if (coupon.expiresAt && now > coupon.expiresAt) return res.status(400).json({ message: 'This coupon has expired' });

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    }

    if (coupon.perUserLimit > 0) {
      const userUsage = await Order.countDocuments({
        user: req.user._id,
        'couponCode': coupon.code,
      });
      if (userUsage >= coupon.perUserLimit) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.value, cartTotal);
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get applicable auto-apply coupons
// @route   POST /api/coupons/auto-apply
export const getAutoApplyCoupons = async (req, res) => {
  try {
    const { cartTotal } = req.body;
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      isAutoApply: true,
      activeFrom: { $lte: now },
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: { $exists: false } }],
      $expr: { $or: [{ $eq: ['$usageLimit', 0] }, { $lt: ['$usedCount', '$usageLimit'] }] },
    }).sort({ priority: -1, value: -1 });

    let bestDiscount = 0;
    let bestCoupon = null;

    for (const coupon of coupons) {
      if (cartTotal < coupon.minOrderAmount) continue;

      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round((cartTotal * coupon.value) / 100);
        if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = Math.min(coupon.value, cartTotal);
      }

      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestCoupon = {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
        };
      }
    }

    res.json({ coupon: bestCoupon, discount: bestDiscount });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
