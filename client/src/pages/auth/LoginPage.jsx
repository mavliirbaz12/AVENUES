import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: data.role, isEmailVerified: data.isEmailVerified, addresses: data.addresses }, data.token);
      toast.success(`Welcome back, ${data.firstName}!`);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post('/api/auth/resend-verification', { email });
      toast.success('Verification email resent! Check your inbox.');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

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
              Welcome
              <br />
              <span className="text-accent">Back</span>
            </h1>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Good to see you again. Your signature scent is waiting.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-white/20 text-xs leading-relaxed">
                "Avenues changed how I think about fragrance. The quiz nailed my personality in 60 seconds."
              </p>
              <p className="text-white/10 text-[10px] mt-2">— Rahul M., Mumbai</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-white/20 text-xs leading-relaxed">
                "Finally a brand that gets it. No more generic perfume ads — just scent that speaks."
              </p>
              <p className="text-white/10 text-[10px] mt-2">— Priya K., Delhi</p>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex flex-col justify-center p-10 md:p-12">
          <div className="md:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="Avenues" className="h-9 object-contain" style={{ mixBlendMode: 'lighten' }} />
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold text-white">Sign In</h2>
            <p className="text-xs text-white/25 mt-1">Enter your credentials to continue.</p>
          </div>

          {/* Error banner */}
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
                  {error.includes('No account found') && (
                    <Link to="/signup" className="text-accent font-semibold hover:underline mt-1 inline-block">
                      Create an account →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1.5">Email</label>
              <div className="relative group">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-4"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1.5">Password</label>
              <div className="relative group">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-accent/50 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:bg-white/[0.06] focus:outline-none transition-all duration-300 pl-10 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-[#050505] text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40 transition-opacity"
              style={{
                background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
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
                  Signing in…
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={14} />
                  Sign In
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/12 text-[10px]">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-sm text-white/25">
            New here?{' '}
            <Link to="/signup" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
