import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <h1 className="font-display text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-white/40 text-sm mb-6">
            We sent a password reset link to <span className="text-accent">{email}</span>.
            Click the link to set a new password. The link expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold text-[#050505] text-sm"
            style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
          >
            Back to Sign In <ArrowRight size={14} />
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
        <h1 className="font-display text-2xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-white/40 text-sm mb-8">
          Enter your email and we will send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 justify-center">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:outline-none transition-all pl-10 pr-4"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" className="inline-block mt-6 text-sm text-white/30 hover:text-white/50 transition-colors">
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}