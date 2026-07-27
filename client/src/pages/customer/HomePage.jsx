import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, Sparkles, Shield, Truck, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TESTIMONIALS } from '@/lib/constants';
import { fadeUpVariants } from '@/lib/animations';
import ProductCard from '@/components/features/ProductCard';
import QuizSection from '@/components/features/QuizSection';
import Skeleton from '@/components/ui/Skeleton';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const pausedRef = useRef(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch { /* ignore */ }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setCurrentTestimonial((p) => (p + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const nextTestimonial = () => setCurrentTestimonial((p) => (p + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setCurrentTestimonial((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const featured = products.slice(0, 4);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="bg-[#050505]">

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-accent/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center px-5 max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 text-accent text-[11px] font-bold tracking-[0.35em] uppercase mb-7 px-4 py-2 rounded-full bg-accent/8 border border-accent/15">
              <Sparkles size={13} /> Premium Indian Fragrances
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-display text-[2.8rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white mb-6 leading-[1.08] tracking-tight"
          >
            Luxury That
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A827] via-[#F5E6A3] to-[#C8A827]">
              Speaks Louder
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-white/55 text-base sm:text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed"
          >
            5 scents. Zero regrets. Find the one that gets people asking "what are you wearing?"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12"
          >
            <Link
              to="/shop"
              className="btn-cta group inline-flex items-center gap-2.5 font-bold text-sm px-8 py-4 rounded-full"
            >
              Shop Now
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#quiz"
              onClick={(e) => { e.preventDefault(); document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium px-8 py-4 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              Take the Quiz
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="relative z-10 w-full overflow-hidden mb-6"
        >
          <div className="marquee-track flex whitespace-nowrap">
            <div className="flex items-center gap-8 sm:gap-12 text-white/25 text-[10px] font-bold uppercase tracking-[0.25em] flex-shrink-0 px-4 sm:px-6">
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Free Delivery on ₹500+</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Crafted in India</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> 8-12 Hour Lasting</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> IFRA Certified</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Cruelty Free</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Free Delivery on ₹500+</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Crafted in India</span>
            </div>
            <div className="flex items-center gap-8 sm:gap-12 text-white/25 text-[10px] font-bold uppercase tracking-[0.25em] flex-shrink-0 px-4 sm:px-6">
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Free Delivery on ₹500+</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Crafted in India</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> 8-12 Hour Lasting</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> IFRA Certified</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Cruelty Free</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Free Delivery on ₹500+</span>
              <span className="flex items-center gap-2"><span className="text-accent/60">★</span> Crafted in India</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-9 rounded-full border border-white/15 flex items-start justify-center p-1.5">
            <div className="w-0.5 h-1.5 bg-accent/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 sm:py-28 bg-[#070707]">
        <div className="container-luxury">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUpVariants} className="text-accent text-xs tracking-[0.25em] uppercase font-bold">The Lineup</motion.span>
            <motion.h2 variants={fadeUpVariants} className="font-display text-3xl sm:text-5xl font-bold mt-3 text-white">Featured Fragrances</motion.h2>
            <motion.p variants={fadeUpVariants} className="text-white/45 mt-4 max-w-md mx-auto text-sm sm:text-base">Five scents. One brand. Zero regrets. Every bottle is a conversation starter.</motion.p>
          </motion.div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`skeleton-feat-${i}`} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((product, i) => (
                <ProductCard key={`feat-${product._id}`} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium px-6 py-3 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              See All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section className="py-24 sm:py-32 bg-[#050505] overflow-hidden relative">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px]" />

        <div className="container-luxury relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeUpVariants}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-7">
                  <Sparkles size={13} className="animate-pulse" /> New Arrival
                </span>
              </motion.div>
              <motion.h2 variants={fadeUpVariants} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.1]">
                Avenues<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#FDF5E6] to-accent">Midnight</span>
              </motion.h2>
              <motion.p variants={fadeUpVariants} className="text-white/60 text-base sm:text-lg mb-8 leading-relaxed max-w-lg font-light">
                Dark oud meets warm vanilla and exotic spices. Built for nights you won't forget — and mornings you'll definitely remember.
              </motion.p>
              <motion.div variants={fadeUpVariants} className="flex gap-4 mb-10">
                <div className="bg-[#111111] border border-white/10 p-4 rounded-2xl flex-1 min-w-[120px] hover:border-accent/25 transition-colors group">
                  <p className="text-3xl font-display font-bold text-white group-hover:text-accent transition-colors">12<span className="text-lg text-accent">+</span></p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-semibold">Hours Lasting</p>
                </div>
                <div className="bg-[#111111] border border-white/10 p-4 rounded-2xl flex-1 min-w-[120px] hover:border-accent/25 transition-colors group">
                  <p className="text-xl font-display font-bold text-white group-hover:text-accent transition-colors mt-1">Extrait</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-semibold">De Parfum</p>
                </div>
              </motion.div>
              <motion.div variants={fadeUpVariants} className="flex flex-wrap items-center gap-6">
                <Link to="/shop" className="btn-cta group inline-flex items-center gap-2.5 font-bold text-sm px-8 py-4 rounded-full">Discover Now <ArrowRight size={16} /></Link>
                <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" /></span>
                  In Stock
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="aspect-[3/4] sm:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#161616] to-[#0A0A0A] border border-white/10 flex items-center justify-center relative group">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[60px]" />
                <div className="relative z-10 w-3/4 h-3/4 rounded-2xl overflow-hidden border border-white/10">
                  {products[0]?.images?.[0] ? (
                    <img
                      src={products[0].images[0]}
                      alt={products[0].name || 'Midnight fragrance'}
                      className="w-full h-full object-contain p-8"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
                      <span className="text-[120px] sm:text-[160px] drop-shadow-2xl select-none opacity-60">🧴</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <QuizSection />

      {/* TOP RATED */}
      <section className="py-20 sm:py-28 bg-[#050505] border-y border-white/5">
        <div className="container-luxury">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.span variants={fadeUpVariants} className="text-accent text-xs tracking-[0.25em] uppercase font-bold">Bestsellers</motion.span>
              <motion.h2 variants={fadeUpVariants} className="font-display text-3xl sm:text-5xl font-bold mt-3 text-white">Top Rated</motion.h2>
            </div>
            <motion.div variants={fadeUpVariants}>
              <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-full transition-all">See Top Picks <ArrowRight size={14} /></Link>
            </motion.div>
          </motion.div>
          {topRated.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`skeleton-top-${i}`} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {topRated.map((product, i) => (
                <ProductCard key={`top-${product._id}`} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY AVENUES */}
      <section className="py-20 sm:py-28 bg-[#070707]">
        <div className="container-luxury">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="text-center mb-14">
            <motion.span variants={fadeUpVariants} className="text-accent text-xs tracking-[0.25em] uppercase font-bold">Why Choose Us</motion.span>
            <motion.h2 variants={fadeUpVariants} className="font-display text-3xl sm:text-5xl font-bold mt-3 text-white">The Avenues Difference</motion.h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Sparkles, title: 'Premium Ingredients', desc: 'Finest essential oils and fragrance compounds, sourced from around the world and blended right here in India.' },
              { icon: Clock, title: '8-12+ Hour Lasting', desc: "Our EDPs don't quit. Apply in the morning, still catching compliments at dinner." },
              { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹500 ship free. Delivered to your door in 5-7 days, anywhere in India.' },
              { icon: Shield, title: 'Authentic Quality', desc: '100% genuine, IFRA-certified fragrances. No fakes, no compromises, no shortcuts.' },
            ].map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45, delay: i * 0.08 }} className="text-center p-6 sm:p-8 rounded-2xl border border-white/6 bg-[#0D0D0D] hover:border-accent/20 transition-all duration-300 group">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center group-hover:bg-accent/15 transition-colors"><b.icon size={24} className="text-accent" /></div>
                <h3 className="font-display text-base sm:text-lg font-bold mb-2 text-white group-hover:text-accent transition-colors">{b.title}</h3>
                <p className="text-xs sm:text-sm text-white/45 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 sm:py-28 bg-[#050505]"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        aria-live="polite"
      >
        <div className="container-luxury">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="text-center mb-14">
            <motion.span variants={fadeUpVariants} className="text-accent text-xs tracking-[0.25em] uppercase font-bold">Reviews</motion.span>
            <motion.h2 variants={fadeUpVariants} className="font-display text-3xl sm:text-5xl font-bold mt-3 text-white">Real People. Real Compliments.</motion.h2>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <motion.div key={currentTestimonial} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-[#0D0D0D] border border-white/6 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-4 right-6 text-white/5 font-display text-8xl leading-none select-none">"</div>
              <div className="relative z-10">
                <div className="flex justify-center gap-1 mb-6">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= TESTIMONIALS[currentTestimonial].rating ? 'fill-accent text-accent' : 'fill-white/10 text-white/10'} />
                  ))}
                </div>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-8 font-light">"{TESTIMONIALS[currentTestimonial].text}"</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                    <span className="text-accent text-sm font-bold">{TESTIMONIALS[currentTestimonial].avatar}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{TESTIMONIALS[currentTestimonial].name}</p>
                    <p className="text-[11px] text-white/40">{TESTIMONIALS[currentTestimonial].product}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={prevTestimonial} aria-label="Previous testimonial" className="w-10 h-10 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center justify-center"><ChevronLeft size={18} /></button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTestimonial(i)} aria-label={`Testimonial ${i + 1} of ${TESTIMONIALS.length}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-accent w-7' : 'bg-white/15 w-1.5 hover:bg-white/30'}`} />
                ))}
              </div>
              <button onClick={nextTestimonial} aria-label="Next testimonial" className="w-10 h-10 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center justify-center"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden border-t border-white/6">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
        <div className="container-luxury text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl sm:text-5xl text-white font-bold mb-5">Not Sure Where to Start?</h2>
            <p className="text-white/45 text-sm sm:text-lg mb-10 max-w-lg mx-auto font-light">Take our 60-second quiz and discover the fragrance that matches your personality.</p>
            <a href="#quiz" className="btn-cta group inline-flex items-center gap-2.5 font-bold text-sm px-10 py-4 rounded-full">Take the Quiz <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
