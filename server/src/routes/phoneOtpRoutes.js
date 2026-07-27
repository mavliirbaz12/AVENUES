import express from 'express';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// POST /api/auth/send-phone-otp — send OTP to phone
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({ phone });
    if (user) {
      user.phoneOtp = hashedOtp;
      user.phoneOtpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
    }

    console.log(`[DEV] Phone OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully', devOtp: otp });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/auth/verify-phone-otp — verify OTP and login/signup
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      phone,
      phoneOtp: hashedOtp,
      phoneOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      addresses: user.addresses || [],
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;