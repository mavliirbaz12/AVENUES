import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  categoryLabel: {
    type: String,
    default: 'eau de parfum for men',
  },
  heroTagline: {
    type: String,
    default: '',
  },
  tagline: {
    type: String,
    default: '',
  },
  oneLiner: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  pricing: {
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
  },
  stock: {
    quantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
  },
  images: [String],
  color: {
    type: String,
    default: '#D4AF37',
  },
  tags: [String],
  benefits: [String],
  faqs: [{
    q: String,
    a: String,
  }],
  fragrance: {
    topNotes: [String],
    heartNotes: [String],
    baseNotes: [String],
    longevity: { type: String, default: '8-10' },
    projection: { type: String, default: 'moderate' },
    size: { type: String, default: '50ml' },
    for: { type: String, default: 'men' },
  },
  occasions: [String],
  type: {
    type: String,
    default: 'Eau De Parfum (EDP)',
  },
  usageInstructions: {
    type: String,
    default: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
  },
  features: [String],
  rating: {
    type: Number,
    default: 5.0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
