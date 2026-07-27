import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    default: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  applicableTo: {
    type: String,
    enum: ['all', 'specific_products', 'specific_categories', 'new_users', 'returning_users'],
    default: 'all',
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  categories: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isAutoApply: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    default: 0,
  },
  activeFrom: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, isAutoApply: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
