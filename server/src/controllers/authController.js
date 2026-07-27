import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail, sendResetEmail } from '../services/emailService.js';
import { loginValidation, registerValidation, forgotPasswordValidation } from '../middleware/validate.js';

const setTokenCookie = (res, token) => {
  res.cookie('avenues_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email. Sign up instead?' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({
      _id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, phone: user.phone || '', role: user.role,
      isEmailVerified: user.isEmailVerified, addresses: user.addresses || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'An account with this email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const user = await User.create({ firstName, lastName, email, password: hashedPassword, emailVerificationToken: hashedToken, emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 });
    try { await sendVerificationEmail(email, firstName, verificationToken); } catch (emailError) { console.error('Failed to send verification email:', emailError.message); }
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: '', role: user.role, isEmailVerified: false, addresses: [], message: 'Account created! Please check your email for a verification link.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    try { await sendResetEmail(email, user.firstName, resetToken); } catch (emailError) { console.error('Failed to send reset email:', emailError.message); user.resetPasswordToken = undefined; user.resetPasswordExpires = undefined; await user.save(); return res.status(500).json({ message: 'Failed to send reset email' }); }
    res.json({ message: 'Password reset email sent. Check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Please provide both current and new password' });
    if (!(await bcrypt.compare(oldPassword, user.password))) return res.status(401).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashedToken, emailVerificationExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    const tokenNew = generateToken(user._id);
    setTokenCookie(res, tokenNew);
    res.json({ message: 'Email verified successfully!', user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.role, isEmailVerified: true, addresses: user.addresses || [] } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    try { await sendVerificationEmail(email, user.firstName, verificationToken); } catch (emailError) { console.error('Failed to send verification email:', emailError.message); return res.status(500).json({ message: 'Failed to send verification email' }); }
    res.json({ message: 'Verification email sent. Check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    try { await sendVerificationEmail(email, user.firstName, verificationToken); } catch (emailError) { console.error('Failed to send verification email:', emailError.message); return res.status(500).json({ message: 'Failed to send verification email' }); }
    res.json({ message: 'Verification email resent. Check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.role, isEmailVerified: user.isEmailVerified, addresses: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ message: 'Unauthorized' });
    const adminExists = await User.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = await User.create({ firstName, lastName, email, password: hashedPassword, role: 'admin', isEmailVerified: true });
    res.status(201).json({ _id: admin._id, firstName: admin.firstName, email: admin.email, role: admin.role, message: 'Admin account created successfully!' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating admin', error: error.message });
  }
};
