import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check, Star, Inbox } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const BENEFITS = [
  '10% off your first order',
  'Early access to new drops',
  'Members-only deals',
];

function PasswordStrength({ password }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full ${i < strength ? colors[strength - 1] : ''}`}
              initial={{ width: 0 }}
              animate={{ width: i < strength ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          </div>
        ))}
      </div>
      <p className="text-2xs text-white/30 mt-1">{strength > 0 ? labels[strength - 1] : 'Enter a password'}</p>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);

  const update = (field, value) => setForm({ ...form, [field]: value });
  const canSubmit = form.firstName.trim() && form.email.trim() && form.password.length >= 8 && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      login({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: data.role, isEmailVerified: false, addresses: data.addresses }, data.token);
      setEmailSent(true);
      toast.success('Account created! Check your email.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post('/api/auth/resend-verification', { email: form.email });
      toast.success('Verification email resent!');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

      <Helmet>
        <title>Create Account | Avenues Perfume</title>
        <meta name="description" content="Create your Avenues Perfume account and start exploring luxury fragrances." />
        <link rel="canonical" href="https://avenues.in/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[920px] flex relative z-10"
        style={{
          background: 'linear-gradient(160deg, rgba(18,18,18,0.98) 0%, rgba(8,8,8,0.99) 100%)',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: '16px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent rounded-t-2xl" />

        {/* Left — Branding */}
        <div className="hidden md:flex flex-1 flex-col justify-between p-10 border-r border-white/5">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <img src="/logo.png" alt="Avenues" className="h-11 object-contain" style={{ mixBlendMode: 'lighten' }} />
            </Link>

            <h1 className="font-display text-3xl font-bold text-white leading-tight mb-2">
              Your Signature
              <br />
              <span className="text-accent">Scent Starts Here</span>
            </h1>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Join thousands who've discovered their perfect fragrance.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-accent/12 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-accent" />
                  </div>
                  <span className="text-white/60 text-sm">{b}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-5 border-t border-white/5">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/6 border-2 border-[#121212] flex items-center justify-center">
                    <User size={11} className="text-white/40" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-2xs text-white/35 mt-0.5">2,847 happy members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex flex-col justify-center p-10 md:p-12">
          <div className="md:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="Avenues" className="h-9 object-contain" style={{ mixBlendMode: 'lighten' }} />
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-white">Join the Club</h2>
            <p className="text-xs text-white/25 mt-1">Create your account. Start smelling different.</p>
          </div>

          {emailSent ? (
            <motion.div
              key="email-sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox size={36} className="text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-white/40 text-sm mb-1">
                We sent a verification link to
              </p>
              <p className="text-white/60 text-sm font-semibold mb-6">{form.email}</p>
              <p className="text-white/25 text-xs mb-6">
                Click the link in the email to verify your account. The link expires in 24 hours.
              </p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-sm text-accent hover:text-accent/80 font-medium transition-colors disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
              </button>
              <div className="mt-6 pt-4 border-t border-white/5">
                <Link to="/login" className="text-sm text-white/30 hover:text-white/50 transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">⚠</span>
                    <div>
                      <p>{error}</p>
                      {error.includes('already exists') && (
                        <Link to="/login" className="text-accent font-semibold hover:underline mt-1 inline-block">
                          Sign in instead →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">First Name</label>
                  <div className="relative group">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                    <input
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-4"
                      placeholder="Arjun"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">Last Name</label>
                  <div className="relative group">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                    <input
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-4"
                      placeholder="Mehta"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">Email</label>
                <div className="relative group">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-4"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-11"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-4"
                    placeholder="••••••••"
                    required
                  />
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check size={14} className="text-green-400" />
                    </motion.div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full h-12 rounded-xl font-bold text-[#050505] text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)',
                  boxShadow: canSubmit ? '0 4px 20px rgba(212,175,55,0.3)' : 'none',
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear', delay: 1 }}
                />
                {loading ? (
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                    Creating…
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={14} />
                    Create Account
                  </span>
                )}
              </button>
            </form>
          )}

          {!emailSent && (
            <>
              <p className="text-center text-2xs text-white/12 mt-5">
                By continuing you agree to our Privacy Policy &amp; Terms
              </p>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/12 text-2xs">or</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <p className="text-center text-sm text-white/25">
                Already a member?{' '}
                <Link to="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
