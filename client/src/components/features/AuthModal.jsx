import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { create } from 'zustand';
import useAuthStore from '@/store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── Global modal store ────────────────────────────────────────────────────────
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'login',
  pendingAction: null,
  openLogin:  (pendingAction = null) => set({ isOpen: true, mode: 'login',  pendingAction }),
  openSignup: (pendingAction = null) => set({ isOpen: true, mode: 'signup', pendingAction }),
  close:   () => set({ isOpen: false, pendingAction: null }),
  setMode: (mode) => set({ mode }),
}));

// ── Reusable input ────────────────────────────────────────────────────────────
function InputField({ label, type = 'text', value, onChange, placeholder, icon: Icon, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        )}
        <input
          type={isPass && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full h-12 rounded-xl text-sm text-white placeholder-white/20 bg-white/[0.03] border border-white/[0.06] focus:border-accent/50 focus:bg-white/[0.06] focus:outline-none transition-all duration-200"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            paddingRight: isPass ? '3rem' : '1rem',
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70 transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { isOpen, mode, pendingAction, close, setMode } = useAuthModal();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const isLogin = mode === 'login';

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload  = isLogin
        ? { email: form.email, password: form.password }
        : { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password };

      const { data } = await axios.post(endpoint, payload);
      login({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: data.role, isEmailVerified: data.isEmailVerified, addresses: data.addresses }, data.token);
      toast.success(isLogin ? `Welcome back, ${data.firstName}!` : `Welcome to Avenues, ${data.firstName}!`);
      close();
      setForm({ firstName: '', lastName: '', email: '', password: '' });
      setError('');
      if (pendingAction) setTimeout(pendingAction, 250);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => setMode(isLogin ? 'signup' : 'login');

  // ── Animation variants ──────────────────────────────────────────────────────
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const desktopVariants = {
    hidden:  { scale: 0.88, opacity: 0, y: 20 },
    visible: { scale: 1,    opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 320, damping: 28 } },
    exit:    { scale: 0.90, opacity: 0, y: 16, transition: { duration: 0.18 } },
  };

  const mobileVariants = {
    hidden:  { y: '100%' },
    visible: { y: 0,      transition: { type: 'spring', stiffness: 280, damping: 32 } },
    exit:    { y: '100%', transition: { duration: 0.22 } },
  };

  // ── Inner content (shared) ──────────────────────────────────────────────────
  const content = (
    <div className={isMobile ? 'px-5 pt-2 safe-bottom' : 'p-7'}
         style={isMobile ? { paddingBottom: `max(2rem, env(safe-area-inset-bottom, 2rem))` } : {}}>

      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex justify-center mb-5 pt-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
      )}

       {/* Logo + heading */}
       <div className="text-center mb-6">
         <div className="flex justify-center mb-3">
           <img
             src="/logo.png"
             alt="Avenues"
             className={isMobile ? 'h-10 object-contain' : 'h-12 object-contain'}
             style={{ mixBlendMode: 'lighten' }}
           />
         </div>
         <AnimatePresence mode="wait">
           <motion.div
             key={mode}
             initial={{ opacity: 0, y: 6 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -6 }}
             transition={{ duration: 0.18 }}
           >
             <h2 className={`font-display font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
               {isLogin ? 'Welcome Back' : 'Join the Club'}
             </h2>
             <p className="text-xs text-white/40 mt-1">
               {isLogin
                 ? 'Sign in. Your scent is waiting.'
                 : 'Create an account. Unlock your signature scent.'}
             </p>
           </motion.div>
         </AnimatePresence>
       </div>

       {/* Inline error banner */}
       {error && (
         <motion.div
           initial={{ opacity: 0, y: -6 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
         >
           <div className="flex items-start gap-2">
             <span className="mt-0.5">⚠</span>
             <div>
               <p>{error}</p>
               {!isLogin && error.toLowerCase().includes('already exists') && (
                 <button
                   type="button"
                   onClick={() => { setMode('login'); setError(''); }}
                   className="text-accent font-semibold hover:underline mt-1 inline-block"
                 >
                   Sign in instead →
                 </button>
               )}
               {isLogin && error.toLowerCase().includes('no account found') && (
                 <button
                   type="button"
                   onClick={() => { setMode('signup'); setError(''); }}
                   className="text-accent font-semibold hover:underline mt-1 inline-block"
                 >
                   Create an account →
                 </button>
               )}
             </div>
           </div>
         </motion.div>
       )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <InputField label="First Name" value={form.firstName} onChange={f('firstName')}
                  placeholder="Arjun" icon={User} required autoComplete="given-name" />
                <InputField label="Last Name"  value={form.lastName}  onChange={f('lastName')}
                  placeholder="Mehta" icon={User} required autoComplete="family-name" />
              </div>
            )}
            <InputField label="Email" type="email" value={form.email} onChange={f('email')}
              placeholder="you@example.com" icon={Mail} required autoComplete="email" />
            <InputField label="Password" type="password" value={form.password} onChange={f('password')}
              placeholder={isLogin ? 'Your password' : 'Min. 8 characters'} icon={Lock} required
              autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </motion.div>
        </AnimatePresence>

        {/* CTA Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="relative w-full h-12 mt-5 rounded-xl font-bold text-[#050505] text-sm overflow-hidden disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)',
            boxShadow: loading ? 'none' : '0 6px 28px rgba(212,175,55,0.40)',
          }}
        >
          {/* Shimmer overlay */}
          <motion.span
            className="absolute inset-0 bg-white/15"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', delay: 0.5 }}
          />
          {loading ? (
            <span className="flex items-center gap-2 relative z-10">
              <span className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
              {isLogin ? 'Signing in…' : 'Creating account…'}
            </span>
          ) : (
            <span className="flex items-center gap-2 relative z-10">
              <Sparkles size={14} />
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={14} />
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-white/25 text-xs">or</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Toggle login / signup */}
      <p className="text-center text-sm text-white/40">
        {isLogin ? "Don't have an account? " : 'Already a member? '}
        <button type="button" onClick={switchMode} className="text-accent hover:text-accent/80 font-bold transition-colors">
          {isLogin ? 'Join free' : 'Sign in'}
        </button>
      </p>

      {!isLogin && (
        <p className="text-center text-2xs text-white/20 mt-3 leading-relaxed">
          By creating an account you agree to our Privacy Policy &amp; Terms
        </p>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[99]"
            style={{ backdropFilter: 'blur(14px)', background: 'rgba(5,5,5,0.72)' }}
            onClick={close}
          />

          {/* ── MOBILE — bottom sheet ── */}
          {isMobile ? (
            <motion.div
              key="auth-sheet"
              variants={mobileVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg,#151515 0%,#0A0A0A 100%)',
                borderTop: '1px solid rgba(212,175,55,0.18)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(212,175,55,0.06)',
                maxHeight: '92dvh',
                overflowY: 'auto',
              }}
            >
              {/* Gold top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent to-transparent" />
              {/* Soft glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-accent/10 blur-2xl rounded-full pointer-events-none" />

              {/* Close button (top-right) */}
              <button
                onClick={close}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>

              {content}
            </motion.div>

          ) : (
          /* ── DESKTOP — centered card ── */
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
              <motion.div
                key="auth-modal"
                variants={desktopVariants}
                initial="hidden" animate="visible" exit="exit"
                className="relative w-full max-w-[420px] rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg,#131313 0%,#0A0A0A 100%)',
                  border: '1px solid rgba(212,175,55,0.14)',
                  boxShadow: '0 30px 90px rgba(0,0,0,0.85), 0 0 60px rgba(212,175,55,0.06)',
                }}
              >
                {/* Gold top bar */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-14 bg-accent/8 blur-3xl rounded-full pointer-events-none" />

                {/* Close */}
                <button
                  onClick={close}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>

                {content}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
