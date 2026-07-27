import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}).select('slug createdAt');
    const baseUrl = process.env.FRONTEND_URL || 'https://avenues.in';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/shop</loc>\n`;
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';

    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/about</loc>\n`;
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';

    for (const product of products) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${product.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(product.createdAt).toISOString()}</lastmod>\n`;
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;