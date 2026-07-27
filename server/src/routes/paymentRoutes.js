import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay customer
// @route   POST /api/payments/create-customer
router.post('/create-customer', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = req.user;

    if (user.razorpayCustomerId) {
      return res.json({ customerId: user.razorpayCustomerId });
    }

    const customer = await razorpay.customers.create({
      name: name || (user.firstName + ' ' + user.lastName),
      email: email || user.email,
      contact: phone || user.phone || '',
      fail_existing: 0,
    });

    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(user._id, { razorpayCustomerId: customer.id });

    res.json({ customerId: customer.id });
  } catch (error) {
    res.status(500).json({ message: 'Customer creation failed', error: error.message });
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, customerId } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || 'rcpt_' + Date.now(),
      customer_id: customerId || undefined,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
    } else {
      res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});

export default router;