import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, Star, ChevronRight, ChevronLeft, ChevronDown, Leaf, Award, Shield, Clock, Wind, Droplets, Check, Sparkles, Zap, HeartHandshake, Package, Gem, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import { useAuthModal } from '@/components/features/AuthModal';
import ProductCard from '@/components/features/ProductCard';
import { formatCurrency, cn } from '@/lib/utils';

function AccordionItem({ id, title, children, openAccordion, toggleAccordion }) {
  const isOpen = openAccordion === id;
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => toggleAccordion(id)} className="w-full py-5 flex items-center justify-between text-left group">
        <span className="font-semibold text-white text-sm group-hover:text-accent transition-colors">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
            <div className="pb-6 text-white/65 text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addToast = useUIStore((s) => s.addToast);
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, allRes] = await Promise.all([
          axios.get(`/api/products/slug/${slug}`),
          axios.get('/api/products'),
        ]);
        setProduct(productRes.data);
        setAllProducts(allRes.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const TOTAL_SLIDES = 4;

  const handlePrevImage = useCallback(() => {
    setActiveImg((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  const handleNextImage = useCallback(() => {
    setActiveImg((prev) => (prev + 1) % TOTAL_SLIDES);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="font-display text-2xl font-semibold mb-4">Product not found</h2>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-[#050505] font-bold rounded-xl">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id || product._id);
  const relatedProducts = allProducts.filter((p) => (p.id || p._id) !== (product.id || product._id)).slice(0, 4);
  const discount = product.pricing.discount || Math.round(((product.pricing.mrp - product.pricing.sellingPrice) / product.pricing.mrp) * 100);
  const allImages = product.images?.length ? product.images : [];

  const thumbnailData = [
    { type: 'image', src: allImages[0], index: 0 },
    {
      type: 'info', id: 'fragrance', title: 'Notes', icon: Sparkles,
      content: {
        top: product.fragrance?.topNotes?.slice(0, 2).join(', ') || 'Citrus, Fresh',
        heart: product.fragrance?.heartNotes?.slice(0, 2).join(', ') || 'Floral, Spicy',
        base: product.fragrance?.baseNotes?.slice(0, 2).join(', ') || 'Woody, Musk'
      }
    },
    {
      type: 'info', id: 'details', title: 'Details', icon: Zap,
      content: {
        longevity: product.fragrance?.longevity || '8-10 hrs',
        projection: product.fragrance?.projection || 'Strong',
        size: product.fragrance?.size || '50ml'
      }
    },
    {
      type: 'info', id: 'why', title: 'Why Us', icon: HeartHandshake,
      content: { points: ['Cruelty Free', 'Premium EDP', 'Made in India', 'IFRA Certified'] }
    }
  ];

  const totalThumbnails = thumbnailData.length;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openLogin(() => { addItem(product, quantity); openCart(); addToast({ type: 'success', message: `${product.name} added!` }); });
      return;
    }
    addItem(product, quantity);
    openCart();
    addToast({ type: 'success', message: `${product.name} added to cart!` });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { openLogin(); return; }
    const added = toggleItem(product);
    addToast({ type: added ? 'success' : 'info', message: added ? 'Added to wishlist!' : 'Removed from wishlist' });
  };

  const toggleAccordion = (id) => setOpenAccordion(openAccordion === id ? null : id);


  const topNotes = product.fragrance?.topNotes || [];
  const heartNotes = product.fragrance?.heartNotes || [];
  const baseNotes = product.fragrance?.baseNotes || [];

  return (
    <>
      <Helmet>
        <title>{product.name} | Avenues Perfume</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={`https://avenues.in/product/${product.slug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Avenues" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={`${product.name} | Avenues`} />
        <meta property="og:description" content={product.description?.slice(0, 155)} />
        <meta property="og:image" content={product.images?.[0]} />
        <meta property="og:url" content={`https://avenues.in/product/${product.slug}`} />
        <meta property="og:price:amount" content={String(product.pricing.sellingPrice)} />
        <meta property="og:price:currency" content="INR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AvenuesIn" />
        <meta name="twitter:title" content={`${product.name} | Avenues`} />
        <meta name="twitter:description" content={product.description?.slice(0, 155)} />
        <meta name="twitter:image" content={product.images?.[0]} />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"Product","name":product.name,"description":product.description,"image":product.images,"offers":{"@type":"Offer","price":product.pricing.sellingPrice,"currency":"INR"}})}</script>
      </Helmet>
    <div className="bg-[#050505] text-white min-h-screen">

      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="container-luxury pt-24 pb-4">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-white/70">{product.name}</span>
        </div>
      </div>

      {/* ── Main Section ───────────────────────────────────────────── */}
      <div className="container-luxury py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">

          {/* ── LEFT: Image Carousel ───────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-3xl overflow-hidden group"
              style={{ background: `linear-gradient(135deg, ${product.color}15, ${product.color}35)` }}
            >
              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-5 left-5 z-10 bg-accent text-[#050505] font-black text-xs px-3 py-1.5 rounded-lg tracking-wide">
                  {discount}% OFF
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={cn(
                  'absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-300',
                  wishlisted ? 'bg-red-500 text-white' : 'bg-black/40 backdrop-blur-sm text-white/70 hover:text-red-400 hover:bg-black/60'
                )}
              >
                <Heart size={18} className={wishlisted ? 'fill-white' : ''} />
              </button>

              {/* Arrows */}
              {totalThumbnails > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} className="text-[#050505]" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} className="text-[#050505]" />
                  </button>
                </>
              )}

              {/* Main Content */}
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                <AnimatePresence mode="wait">
                  {thumbnailData[activeImg]?.type === 'image' ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {allImages[activeImg] ? (
                        <img src={allImages[activeImg]} alt={product.name} className="h-4/5 w-full object-contain drop-shadow-2xl" />
                      ) : (
                        <span className="text-[160px] md:text-[200px] drop-shadow-2xl select-none">🧴</span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center p-8"
                    >
                      {/* Fragrance Notes Card */}
                      {thumbnailData[activeImg]?.id === 'fragrance' && (
                        <div className="bg-[#111111]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-xs w-full">
                          <div className="flex items-center gap-2 mb-4 text-accent">
                            <Sparkles size={20} />
                            <span className="font-semibold">Fragrance Notes</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs text-white/40 uppercase tracking-wider">Top</span>
                              <p className="text-white/80 text-sm">{thumbnailData[activeImg].content.top}</p>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                              <span className="text-xs text-white/40 uppercase tracking-wider">Heart</span>
                              <p className="text-white/80 text-sm">{thumbnailData[activeImg].content.heart}</p>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                              <span className="text-xs text-white/40 uppercase tracking-wider">Base</span>
                              <p className="text-white/80 text-sm">{thumbnailData[activeImg].content.base}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Details Card */}
                      {thumbnailData[activeImg]?.id === 'details' && (
                        <div className="bg-[#111111]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-xs w-full">
                          <div className="flex items-center gap-2 mb-4 text-accent">
                            <Zap size={20} />
                            <span className="font-semibold">Key Details</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <Clock size={18} className="mx-auto text-accent mb-1" />
                              <p className="text-xs text-white/60">Lasts</p>
                              <p className="text-sm font-bold text-white">{thumbnailData[activeImg].content.longevity}</p>
                            </div>
                            <div>
                              <Wind size={18} className="mx-auto text-accent mb-1" />
                              <p className="text-xs text-white/60">Projection</p>
                              <p className="text-sm font-bold text-white">{thumbnailData[activeImg].content.projection}</p>
                            </div>
                            <div>
                              <Droplets size={18} className="mx-auto text-accent mb-1" />
                              <p className="text-xs text-white/60">Size</p>
                              <p className="text-sm font-bold text-white">{thumbnailData[activeImg].content.size}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Why Avenues Card */}
                      {thumbnailData[activeImg]?.id === 'why' && (
                        <div className="bg-[#111111]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-xs w-full">
                          <div className="flex items-center gap-2 mb-4 text-accent">
                            <HeartHandshake size={20} />
                            <span className="font-semibold">Why Avenues?</span>
                          </div>
                          <ul className="space-y-2">
                            {thumbnailData[activeImg].content.points.map((point, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                <Check size={14} className="text-accent shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Glass sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/3 to-white/0 pointer-events-none" />
            </motion.div>

            {/* Thumbnails */}
            {totalThumbnails > 1 && (
              <div className="mt-4 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex gap-3 min-w-max">
                  {thumbnailData.map((thumb, i) => (
                    <button
                      key={thumb.type === 'image' ? 'img' : thumb.id}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
                        activeImg === i
                          ? 'border-accent scale-105 shadow-lg shadow-accent/20'
                          : 'border-white/10 hover:border-white/30 hover:scale-105'
                      )}
                      style={{
                        background: thumb.type === 'image' ? `${product.color}20` : '#111111'
                      }}
                    >
                      {thumb.type === 'image' ? (
                        thumb.src ? (
                          <img src={thumb.src} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-2xl"
                            style={{ background: `linear-gradient(135deg, ${product.color}30, ${product.color}50)` }}
                          >
                            🧴
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-[#111111] to-[#0a0a0a]">
                          <thumb.icon size={20} className={cn(
                            'mb-1',
                            activeImg === i ? 'text-accent' : 'text-white/60'
                          )} />
                          <span className={cn(
                            'text-2xs font-medium uppercase tracking-wider',
                            activeImg === i ? 'text-accent' : 'text-white/50'
                          )}>
                            {thumb.title}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dots */}
            {totalThumbnails > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {thumbnailData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all duration-200',
                      activeImg === i ? 'bg-accent w-4' : 'bg-white/20 hover:bg-white/40'
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {(product.tags || []).map((tag) => (
                <span key={tag} className="text-2xs font-bold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>

            {/* Name + Category */}
            <div>
              {product.categoryLabel && (
                <p className="text-2xs text-white/40 uppercase tracking-marquee font-semibold mb-3">
                  {product.categoryLabel}
                </p>
              )}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-2">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-accent/80 text-base font-light italic">{product.tagline}</p>
              )}
              {product.oneLiner && (
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{product.oneLiner}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={15} className={s <= Math.floor(product.rating) ? 'fill-accent text-accent' : 'fill-white/15 text-white/15'} />
                ))}
              </div>
              <span className="text-sm text-white/50">{product.rating} · {product.reviewCount} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">{formatCurrency(product.pricing.sellingPrice)}</span>
              {product.pricing.mrp !== product.pricing.sellingPrice && (
                <>
                  <span className="text-xl text-white/30 line-through">{formatCurrency(product.pricing.mrp)}</span>
                  <span className="text-sm font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-lg">
                    Save {formatCurrency(product.pricing.mrp - product.pricing.sellingPrice)}
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-white/65 leading-relaxed border-t border-white/10 pt-5">
              {product.shortDescription}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 py-2">
              {[
                { icon: Clock, val: `${product.fragrance?.longevity || '8-10'} hrs`, label: 'Longevity' },
                { icon: Wind, val: product.fragrance?.projection || 'Strong', label: 'Projection' },
                { icon: Droplets, val: product.fragrance?.size || '50ml', label: 'Volume' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="text-center p-3 bg-[#111111] rounded-xl border border-white/10 hover:border-accent/30 transition-colors">
                  <Icon size={18} className="mx-auto text-accent mb-2" />
                  <p className="text-sm font-bold text-white capitalize">{val}</p>
                  <p className="text-2xs text-white/40 mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="flex items-center border border-white/15 rounded-xl overflow-hidden bg-[#111111]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-12 flex items-center justify-center text-white hover:text-accent hover:bg-white/5 transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-base font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-12 flex items-center justify-center text-white hover:text-accent hover:bg-white/5 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 h-12 flex items-center justify-center gap-2.5 font-bold text-[#050505] text-sm rounded-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #C8A827, #F5CC55, #C8A827)',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                  }}
                >
                  <ShoppingBag size={17} /> Add to Cart
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                {[
                  { icon: Leaf, label: 'Cruelty Free' },
                  { icon: Clock, label: 'Long Lasting' },
                  { icon: Award, label: 'Premium EDP' },
                  { icon: Shield, label: 'IFRA Certified' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon size={16} className="text-accent" />
                    <span className="text-2xs uppercase tracking-wider text-white/40 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordions */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0D0D0D] divide-y divide-white/8 px-5">
              <AccordionItem id="description" title="About This Fragrance" openAccordion={openAccordion} toggleAccordion={toggleAccordion}>
                <p>{product.longDescription || product.shortDescription}</p>
              </AccordionItem>

              <AccordionItem id="notes" title="Scent Notes" openAccordion={openAccordion} toggleAccordion={toggleAccordion}>
                <div className="space-y-4">
                  {[
                    { label: 'Top Notes', notes: topNotes, color: '#E8D5B7', desc: 'The first impression — fresh, bright, attention-grabbing.' },
                    { label: 'Heart Notes', notes: heartNotes, color: '#C77986', desc: 'The soul of the fragrance — rich, warm, lingering.' },
                    { label: 'Base Notes', notes: baseNotes, color: '#8B7355', desc: 'The lasting memory — deep, smooth, unforgettable.' },
                  ].filter(g => g.notes.length > 0).map((g) => (
                    <div key={g.label}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{g.label}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-1">
                        {g.notes.map((note) => (
                          <span key={note} className="text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/80">{note}</span>
                        ))}
                      </div>
                      <p className="text-xs text-white/35 italic">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </AccordionItem>

              <AccordionItem id="benefits" title="Features & Benefits" openAccordion={openAccordion} toggleAccordion={toggleAccordion}>
                <ul className="space-y-2">
                  {(product.benefits || []).map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check size={13} className="text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem id="usage" title="Details & Usage" openAccordion={openAccordion} toggleAccordion={toggleAccordion}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Type', val: product.type },
                      { label: 'For', val: product.fragrance?.for },
                      { label: 'Occasions', val: (product.occasions || []).join(', ') },
                    ].filter(d => d.val).map(d => (
                      <div key={d.label}>
                        <p className="text-white/40 text-xs mb-0.5 uppercase tracking-wider">{d.label}</p>
                        <p className="text-white capitalize text-sm">{d.val}</p>
                      </div>
                    ))}
                  </div>
                  {product.usageInstructions && (
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">How to Apply</p>
                      <p>{product.usageInstructions}</p>
                    </div>
                  )}
                </div>
              </AccordionItem>

              <AccordionItem id="faqs" title="FAQs" openAccordion={openAccordion} toggleAccordion={toggleAccordion}>
                <div className="space-y-4">
                  {(product.faqs || []).map((faq, i) => (
                    <div key={i} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <p className="text-white font-medium text-sm mb-1">{faq.q}</p>
                      <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Scent Notes Visual Section ────────────────────────────── */}
      {(topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0) && (
        <div className="container-luxury py-16 border-t border-white/10">
          <div className="text-center mb-10">
            <span className="text-accent text-xs tracking-widest uppercase font-semibold">The Scent</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">What You'll Smell</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Top Notes', notes: topNotes, gradient: 'from-amber-500/20 to-orange-500/20', icon: '✨', desc: 'First 15 minutes' },
              { label: 'Heart Notes', notes: heartNotes, gradient: 'from-rose-500/20 to-pink-500/20', icon: '💗', desc: '1-3 hours in' },
              { label: 'Base Notes', notes: baseNotes, gradient: 'from-amber-700/20 to-yellow-700/20', icon: '🪵', desc: 'Hours 3+' },
            ].filter(g => g.notes.length > 0).map((g) => (
              <div
                key={g.label}
                className={`bg-gradient-to-br ${g.gradient} border border-white/10 rounded-2xl p-6 text-center hover:border-accent/30 transition-all duration-300`}
              >
                <span className="text-3xl mb-3 block">{g.icon}</span>
                <h3 className="font-display text-lg font-bold text-white mb-1">{g.label}</h3>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">{g.desc}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {g.notes.map((note) => (
                    <span key={note} className="text-xs px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/75">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Try Before You Buy ────────────────────────────────────── */}
      <div className="container-luxury py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Not Sure Yet?</h2>
            <p className="text-white/50 mt-3 text-sm">Try a sample before committing to the full bottle</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Package, title: 'Discovery Set', desc: 'Try all 5 scents in 5ml travel sizes. ₹499', cta: 'Coming Soon', coming: true },
              { icon: Award, title: 'Best of Avenues', desc: 'Top 3 bestsellers in one box. ₹349', cta: 'Coming Soon', coming: true },
              { icon: Gem, title: 'Premium Trial', desc: 'Sample White Oud + Night Drip together. ₹249', cta: 'Coming Soon', coming: true },
            ].map(({ icon: Icon, title, desc, cta }) => (
              <div key={title} className="bg-[#111111] border border-white/10 rounded-2xl p-6 text-center hover:border-accent/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm mb-4">{desc}</p>
                <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">{cta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Avenues ───────────────────────────────────────────── */}
      <div className="container-luxury pb-10">
        <div className="bg-gradient-to-br from-[#111111] to-[#0D0D0D] border border-white/10 rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Why Avenues?</h2>
            <p className="text-white/50 text-sm mt-2">Premium quality. Honest pricing. Zero shortcuts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2">25% Oil Concentration</h3>
              <p className="text-white/50 text-xs leading-relaxed">Most perfumes use 10-15% oil. We use 25%. That's why ours lasts 8-12+ hours.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Gem size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2">₹999 - ₹1,399 Only</h3>
              <p className="text-white/50 text-xs leading-relaxed">Premium EDPs that smell like designer but cost a fraction. No markup, just quality.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Award size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2">Made in India</h3>
              <p className="text-white/50 text-xs leading-relaxed">Globally sourced ingredients. Blended and bottled right here in India.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ───────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="container-luxury py-20 border-t border-white/10 mt-10">
          <div className="text-center mb-12">
            <span className="text-accent text-xs tracking-widest uppercase font-semibold">You May Also Like</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">Complete the Collection</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p._id || p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
