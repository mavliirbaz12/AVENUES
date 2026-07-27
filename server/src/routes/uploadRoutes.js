import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'avenues/products', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      });
    });
    const urls = await Promise.all(uploadPromises);
    res.json({ urls, message: `${urls.length} image(s) uploaded successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

const avatarUpload = upload.single('avatar');

router.post('/avatar', protect, (req, res, next) => avatarUpload(req, res, async (err) => {
  if (err) return res.status(400).json({ message: err.message || 'File upload error' });
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avenues/avatars', transformation: [{ quality: 'auto', fetch_format: 'auto', width: 200, height: 200, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, { avatarUrl: result.secure_url });
    res.json({ avatarUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
}));

export default router;