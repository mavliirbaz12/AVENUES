import express from 'express';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import './src/config/passport.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import generateToken from './src/utils/generateToken.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import sitemapRoutes from './src/routes/sitemapRoutes.js';
import phoneOtpRoutes from './src/routes/phoneOtpRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Critical env var validation — fail fast in production
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'MONGO_URI', 'CLIENT_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

connectDB();

const app = express();

app.use(express.json());
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using insecure fallback — set this in production!');
}
app.use(session({
  secret: process.env.JWT_SECRET || 'avenues-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));
app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/', sitemapRoutes);
app.use('/api/auth', phoneOtpRoutes);

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed` }), (req, res) => {
  if (!req.user) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
  const token = generateToken(req.user._id);
  const userData = encodeURIComponent(JSON.stringify({
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone || '',
    role: req.user.role || 'user',
    isEmailVerified: req.user.isEmailVerified,
    addresses: req.user.addresses || [],
  }));
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&user=${userData}`);
});

app.get('/', (req, res) => res.send('Avenues API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

