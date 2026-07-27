import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import connectDB from './src/config/db.js';

dotenv.config();
await connectDB();

const products = [
  {
    name: 'Avenues Intense',
    slug: 'avenues-intense',
    shortDescription: 'A bold and sophisticated fragrance crafted for those who carry confidence with style.',
    description: 'AVENUES INTENSE is a bold and sophisticated fragrance. A perfect blend of fresh citrus and warm woody notes, it creates a powerful and long-lasting impression wherever you go.',
    pricing: { mrp: 1499, sellingPrice: 1199, discount: 20 },
    stock: { quantity: 50, lowStockThreshold: 10 },
    images: ['/images/intense.jpg'],
    color: '#2C3E50',
    tags: ['Fresh', 'Woody', 'Bold'],
    rating: 4.5,
    reviewCount: 128,
  },
  {
    name: 'Avenues Pink Aura',
    slug: 'avenues-pink-aura',
    shortDescription: 'An elegant fragrance with fresh florals and soft woody warmth for special moments.',
    description: 'AVENUES PINK AURA captures elegance in a bottle. A refined blend of fresh florals and soft woody undertones creates an irresistible aura.',
    pricing: { mrp: 1499, sellingPrice: 1299, discount: 13 },
    stock: { quantity: 35, lowStockThreshold: 10 },
    images: ['/images/pink-aura.jpg'],
    color: '#C77986',
    tags: ['Floral', 'Woody', 'Elegant'],
    rating: 4.7,
    reviewCount: 95,
  },
  {
    name: 'Avenues Night Drip',
    slug: 'avenues-night-drip',
    shortDescription: 'A warm and spicy seduction with sweet vanilla undertones for unforgettable nights.',
    description: 'AVENUES NIGHT DRIP is the ultimate weapon for the night. Warm, sweet, and intoxicating — this fragrance blends spicy cinnamon with rich vanilla.',
    pricing: { mrp: 1499, sellingPrice: 1199, discount: 20 },
    stock: { quantity: 25, lowStockThreshold: 10 },
    images: ['/images/night-drip.jpg'],
    color: '#1A1A2E',
    tags: ['Sweet', 'Spicy', 'Warm'],
    rating: 4.8,
    reviewCount: 156,
  },
  {
    name: 'Avenues Blue Mist',
    slug: 'avenues-blue-mist',
    shortDescription: 'A crisp aquatic fragrance with modern freshness for the everyday gentleman.',
    description: 'AVENUES BLUE MIST is your everyday companion. A fresh and clean aquatic scent that embodies modern masculinity.',
    pricing: { mrp: 1299, sellingPrice: 999, discount: 23 },
    stock: { quantity: 60, lowStockThreshold: 10 },
    images: ['/images/blue-mist.jpg'],
    color: '#3498DB',
    tags: ['Fresh', 'Aquatic', 'Clean'],
    rating: 4.4,
    reviewCount: 89,
  },
  {
    name: 'Avenues White Oud',
    slug: 'avenues-white-oud',
    shortDescription: 'A rich oriental fragrance with precious oud and warm amber for the modern king.',
    description: 'AVENUES WHITE OUD is the pinnacle of luxury. This rich oriental fragrance combines precious oud with warm amber and saffron.',
    pricing: { mrp: 1499, sellingPrice: 1399, discount: 7 },
    stock: { quantity: 20, lowStockThreshold: 5 },
    images: ['/images/white-oud.jpg'],
    color: '#8B7355',
    tags: ['Oriental', 'Warm', 'Rich'],
    rating: 4.9,
    reviewCount: 72,
  },
];

try {
  await Product.deleteMany({});
  console.log('🗑️  Old products cleared');

  await Product.insertMany(products);
  console.log('✅  5 Avenues products seeded to MongoDB Atlas!');

  process.exit(0);
} catch (error) {
  console.error('❌  Seeder Error:', error.message);
  process.exit(1);
}
