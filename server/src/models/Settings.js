import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'AVENUES PERFUME' },
  storeEmail: { type: String, default: 'hello@avenues.com' },
  storePhone: { type: String, default: '+91 98765 43210' },
  storeAddress: { type: String, default: 'Mumbai, Maharashtra, India' },
  freeShippingThreshold: { type: Number, default: 500 },
  standardShipping: { type: Number, default: 49 },
  expressShipping: { type: Number, default: 99 },
  taxRate: { type: Number, default: 18 },
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
