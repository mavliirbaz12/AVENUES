import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthModal } from './AuthModal';
import useAuthStore from '@/store/authStore';

const DISMISS_KEY = 'avenues_signup_bar_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export default function SignupBar() {
  const [show, setShow] = useState(false);
  const { openSignup } = useAuthModal();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const isExcluded =
    user ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup');

  useEffect(() => {
    if (isExcluded) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [isExcluded]);

  useEffect(() => {
    if (isExcluded || show) return;
    const handleExit = (e) => {
      if (e.clientY <= 0) {
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (!dismissed || Date.now() - Number(dismissed) >= DISMISS_DURATION) {
          setShow(true);
        }
      }
    };
    document.addEventListener('mouseleave', handleExit);
    return () => document.removeEventListener('mouseleave', handleExit);
  }, [isExcluded, show]);

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  const handleSignup = () => {
    dismiss();
    openSignup();
  };

  if (isExcluded) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[85]"
        >
          <div
            className="relative"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,15,0.97) 0%, rgba(8,8,8,0.99) 100%)',
              borderTop: '1px solid rgba(212,175,55,0.15)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.04)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="hidden sm:flex w-9 h-9 rounded-full bg-accent/10 items-center justify-center flex-shrink-0 border border-accent/15">
                  <Sparkles size={16} className="text-accent" />
                </div>
                <p className="text-white/70 text-sm truncate">
                  <span className="text-white font-medium">Logged in yet?</span>{' '}
                  <span className="text-white/40">Unlock </span>
                  <span className="text-accent font-semibold">10% off</span>
                  <span className="text-white/40"> your first order</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleSignup}
                  className="h-9 px-5 rounded-lg font-bold text-[#050505] text-xs flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)',
                    boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                  }}
                >
                  Get My Code
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={dismiss}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-all flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
