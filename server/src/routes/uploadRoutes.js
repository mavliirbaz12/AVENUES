import express from 'express';
import upload from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload — upload 1 or more product images
router.post('/', protect, admin, upload.array('images', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    // Return public URLs for each uploaded file
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls, message: `${urls.length} image(s) uploaded successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
