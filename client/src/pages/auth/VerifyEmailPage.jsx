import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const login = useAuthStore((s) => s.login);
  const [status, setStatus] = useState('verifying');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      try {
        const { data } = await axios.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        login(data.user, data.token);
        toast.success('Email verified! Welcome to Avenues.');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token, login]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    try {
      await axios.post('/api/auth/resend-verification', { email: resendEmail });
      toast.success('Verification email sent! Check your inbox.');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setResendLoading(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 size={36} className="text-accent animate-spin" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Verifying Your Email</h1>
          <p className="text-white/40 text-sm">Please wait while we confirm your email address...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto bg-[#111111] border border-white/5 p-10 rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-400" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Email Verified!</h1>
          <p className="text-white/40 text-sm mb-6">
            Your account is fully set up. You can now browse, shop, and checkout.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold text-[#050505] text-sm"
            style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto bg-[#111111] border border-white/5 p-10 rounded-2xl"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} className="text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Verification Failed</h1>
        <p className="text-white/40 text-sm mb-6">
          This verification link is invalid or has expired. You can request a new one below.
        </p>

        <form onSubmit={handleResend} className="space-y-3">
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:outline-none transition-all pl-10 pr-4"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={resendLoading || resendCooldown > 0}
            className="w-full h-12 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
          >
            {resendLoading ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
          </button>
        </form>

        <Link to="/login" className="inline-block mt-4 text-sm text-white/30 hover:text-white/50 transition-colors">
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}
