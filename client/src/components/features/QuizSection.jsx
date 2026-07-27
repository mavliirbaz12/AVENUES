import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import axios from 'axios';
import { QUIZ_QUESTIONS, QUIZ_DEFAULT_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';

const SUBTITLES = {
  0: 'Pick the one that feels like you.',
  1: 'Every nose has a type. Trust yours.',
  2: 'Be honest — we won\'t judge.',
  3: 'There\'s no wrong answer here.',
  4: 'Last one. Make it count.',
};

export default function QuizSection() {
  const [products, setProducts] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [resultProduct, setResultProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch { /* ignore */ }
    };
    fetchProducts();
  }, []);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      const firstAnswer = newAnswers[0];
      const productId = QUIZ_DEFAULT_MAP[firstAnswer] || 1;
      const product = products.find((p) => p.id === productId || p._id === String(productId));
      setResultProduct(product || null);
      if (!product) {
        setShowResult(false);
        setTimeout(() => restart(), 300);
      } else {
        setTimeout(() => setShowResult(true), 500);
      }
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
    setResultProduct(null);
  };

  /* ── Result Screen ──────────────────────────────────────── */
  if (showResult && resultProduct) {
    return (
      <section id="quiz" className="py-20 sm:py-28 bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center px-4 relative z-10"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <Sparkles size={40} className="text-accent mx-auto mb-4" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
          >
            Your scent matches you
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl sm:text-4xl text-white font-bold mb-8"
          >
            We Found Your Match
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 text-left"
          >
            {/* Product Image Area */}
            <div
              className="w-full aspect-[4/3] rounded-2xl flex items-center justify-center mb-6"
              style={{ background: `linear-gradient(135deg, ${resultProduct.color}20, ${resultProduct.color}40)` }}
            >
              <motion.span
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[80px] sm:text-[100px] select-none"
              >
                🧴
              </motion.span>
            </div>

            {/* Product Info */}
            <p className="text-accent text-[10px] font-bold tracking-[0.25em] uppercase mb-1.5">
              {resultProduct.categoryLabel}
            </p>
            <h3 className="font-display text-2xl sm:text-3xl text-white font-bold mb-1">
              {resultProduct.name}
            </h3>
            <p className="font-display text-base sm:text-lg text-accent font-semibold uppercase tracking-wide mb-4">
              {resultProduct.heroTagline}
            </p>
            <p className="text-white/55 text-sm leading-relaxed mb-5">
              {resultProduct.oneLiner}
            </p>

            {/* Benefit Bullets */}
            <div className="space-y-2.5 mb-6">
              {resultProduct.benefits.slice(0, 3).map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-accent" />
                  </div>
                  <span className="text-white/65 text-sm leading-snug">{b}</span>
                </motion.div>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-white font-display text-2xl font-bold">
                ₹{resultProduct.pricing.sellingPrice}
              </span>
              {resultProduct.pricing.discount > 0 && (
                <>
                  <span className="text-white/30 line-through text-sm">₹{resultProduct.pricing.mrp}</span>
                  <span className="bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {resultProduct.pricing.discount}% off
                  </span>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/product/${resultProduct.slug}`}
                className="btn-cta flex-1 inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-full"
              >
                Get It <ArrowRight size={15} />
              </Link>
              <button
                onClick={restart}
                className="flex-1 inline-flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm font-medium px-6 py-3.5 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
              >
                Retake Quiz
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  /* ── Question Screen ────────────────────────────────────── */
  const question = QUIZ_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <section id="quiz" className="py-20 sm:py-28 bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_60%)]" />

      <div className="max-w-2xl mx-auto px-4 w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Sparkles size={28} className="text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl sm:text-4xl text-white font-bold mb-2">
            Your scent journey starts here
          </h1>
          <p className="text-white/40 text-sm">
            Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-10">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="bg-accent h-full rounded-full"
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Question + Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h2 className="font-display text-2xl sm:text-3xl text-white mb-2 font-semibold">
              {question.question}
            </h2>
            <p className="text-white/35 text-sm mb-8">{SUBTITLES[currentQ]}</p>

            {/* Option Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className={cn(
                    'relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left group',
                    'flex items-center gap-4',
                    answers[currentQ] === opt.value
                      ? 'border-accent bg-accent/10 shadow-[0_0_30px_rgba(212,175,55,0.1)]'
                      : 'border-white/8 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                  )}
                >
                  <span className="text-3xl sm:text-4xl flex-shrink-0">{opt.icon}</span>
                  <div>
                    <span className="text-white font-semibold text-base sm:text-lg block">
                      {opt.label}
                    </span>
                  </div>
                  {answers[currentQ] === opt.value && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check size={12} className="text-[#050505]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Back Button */}
        {currentQ > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCurrentQ(currentQ - 1)}
            className="mt-8 text-white/40 hover:text-white flex items-center gap-2 mx-auto transition-colors text-sm font-medium"
          >
            <ArrowLeft size={15} /> Go Back
          </motion.button>
        )}
      </div>
    </section>
  );
}
