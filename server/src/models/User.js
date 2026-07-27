import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  alternativePhone: String,
  buildingName: String,
  flatRoomNumber: String,
  street: { type: String, required: true },
  area: String,
  apartment: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: String,
  location: {
    lat: Number,
    lng: Number,
  },
  deliveryPreferences: {
    preferredTime: { type: String, default: 'anytime' },
    morningDelivery: { type: Boolean, default: false },
    eveningDelivery: { type: Boolean, default: false },
    weekendAvailable: { type: Boolean, default: true },
    saturdayDelivery: { type: Boolean, default: true },
    sundayDelivery: { type: Boolean, default: false },
    bestTimeToCall: String,
    deliveryInstructions: String,
  },
  whatsappUpdates: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  addresses: [addressSchema],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
