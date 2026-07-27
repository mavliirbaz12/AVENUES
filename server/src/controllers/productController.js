import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || 'New Avenues Product',
      slug: req.body.slug || `new-product-${Date.now()}`,
      categoryLabel: req.body.categoryLabel || 'eau de parfum for men',
      heroTagline: req.body.heroTagline || '',
      tagline: req.body.tagline || '',
      oneLiner: req.body.oneLiner || '',
      shortDescription: req.body.shortDescription || 'Experience luxury.',
      longDescription: req.body.longDescription || '',
      description: req.body.description || 'Detailed description here.',
      pricing: {
        mrp: req.body.mrp || 0,
        sellingPrice: req.body.sellingPrice || 0,
      },
      stock: {
        quantity: req.body.stock || 0,
        lowStockThreshold: req.body.lowStockThreshold || 10,
      },
      images: req.body.images || [],
      color: req.body.color || '#D4AF37',
      tags: req.body.tags || [],
      benefits: req.body.benefits || [],
      faqs: req.body.faqs || [],
      fragrance: req.body.fragrance || {},
      occasions: req.body.occasions || [],
      type: req.body.type || 'Eau De Parfum (EDP)',
      usageInstructions: req.body.usageInstructions || 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
      features: req.body.features || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Clean up uploaded images
      if (product.images && product.images.length > 0) {
        const uploadsDir = path.join(__dirname, '../../uploads');
        product.images.forEach(imgUrl => {
          const filename = imgUrl.replace('/uploads/', '');
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Basic fields
    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.slug !== undefined) product.slug = req.body.slug;
    if (req.body.categoryLabel !== undefined) product.categoryLabel = req.body.categoryLabel;
    if (req.body.heroTagline !== undefined) product.heroTagline = req.body.heroTagline;
    if (req.body.tagline !== undefined) product.tagline = req.body.tagline;
    if (req.body.oneLiner !== undefined) product.oneLiner = req.body.oneLiner;
    if (req.body.shortDescription !== undefined) product.shortDescription = req.body.shortDescription;
    if (req.body.longDescription !== undefined) product.longDescription = req.body.longDescription;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.color !== undefined) product.color = req.body.color;
    if (req.body.tags !== undefined) product.tags = req.body.tags;
    if (req.body.images !== undefined) product.images = req.body.images;
    if (req.body.rating !== undefined) product.rating = req.body.rating;
    if (req.body.reviewCount !== undefined) product.reviewCount = req.body.reviewCount;
    if (req.body.benefits !== undefined) product.benefits = req.body.benefits;
    if (req.body.faqs !== undefined) product.faqs = req.body.faqs;
    if (req.body.occasions !== undefined) product.occasions = req.body.occasions;
    if (req.body.type !== undefined) product.type = req.body.type;
    if (req.body.usageInstructions !== undefined) product.usageInstructions = req.body.usageInstructions;
    if (req.body.features !== undefined) product.features = req.body.features;

    // Fragrance sub-document
    if (req.body.fragrance !== undefined) {
      if (req.body.fragrance.topNotes !== undefined) product.fragrance.topNotes = req.body.fragrance.topNotes;
      if (req.body.fragrance.heartNotes !== undefined) product.fragrance.heartNotes = req.body.fragrance.heartNotes;
      if (req.body.fragrance.baseNotes !== undefined) product.fragrance.baseNotes = req.body.fragrance.baseNotes;
      if (req.body.fragrance.longevity !== undefined) product.fragrance.longevity = req.body.fragrance.longevity;
      if (req.body.fragrance.projection !== undefined) product.fragrance.projection = req.body.fragrance.projection;
      if (req.body.fragrance.size !== undefined) product.fragrance.size = req.body.fragrance.size;
      if (req.body.fragrance.for !== undefined) product.fragrance.for = req.body.fragrance.for;
    }

    // Pricing
    if (req.body.sellingPrice !== undefined) product.pricing.sellingPrice = Number(req.body.sellingPrice);
    if (req.body.mrp !== undefined) product.pricing.mrp = Number(req.body.mrp);
    if (req.body.mrp && req.body.sellingPrice) {
      product.pricing.discount = Math.round(((req.body.mrp - req.body.sellingPrice) / req.body.mrp) * 100);
    }

    // Stock
    if (req.body.stock !== undefined) product.stock.quantity = Number(req.body.stock);
    if (req.body.lowStockThreshold !== undefined) product.stock.lowStockThreshold = Number(req.body.lowStockThreshold);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
};
