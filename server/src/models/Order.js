import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: String,
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: { type: String, unique: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: String,
    buildingName: String,
    flatRoomNumber: String,
    street: { type: String, required: true },
    area: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    landmark: String,
    location: {
      lat: Number,
      lng: Number,
    },
    label: { type: String, default: 'Home' },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentResult: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: String,
  },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  couponCode: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'flat', ''], default: '' },
  discountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    description: String,
  }],
  trackingNumber: String,
  courierName: String,
  deliveryInstructions: String,
  whatsappUpdates: { type: Boolean, default: true },
  deliveredAt: Date,
  cancelledAt: Date,
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'AVN';
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `${prefix}-${datePart}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
