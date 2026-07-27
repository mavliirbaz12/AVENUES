import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import { useAuthModal } from './AuthModal';
import { cn } from '@/lib/utils';

export default function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addToast = useUIStore((s) => s.addToast);
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const [imageError, setImageError] = useState(false);

  const wishlisted = isInWishlist(product.id || product._id);
  const discount = product.pricing?.discount ||
    (product.pricing?.mrp && product.pricing?.sellingPrice && product.pricing.mrp > product.pricing.sellingPrice
      ? Math.round(((product.pricing.mrp - product.pricing.sellingPrice) / product.pricing.mrp) * 100)
      : 0);
  const hasReviews = (product.reviewCount || 0) > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin(() => { addItem(product); openCart(); addToast({ type: 'success', message: `${product.name} added to cart!` }); });
      return;
    }
    addItem(product);
    openCart();
    addToast({ type: 'success', message: `${product.name} added to cart!` });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin(() => { const added = toggleItem(product); addToast({ type: added ? 'success' : 'info', message: added ? 'Added to wishlist!' : 'Removed from wishlist' }); });
      return;
    }
    const added = toggleItem(product);
    addToast({ type: added ? 'success' : 'info', message: added ? 'Added to wishlist!' : 'Removed from wishlist' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="relative"
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative bg-[#0D0D0D] border border-white/8 rounded-xl overflow-hidden hover:border-accent/25 transition-all duration-400">

          <div
            className="relative aspect-[3/4] overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${product.color || '#D4AF37'}12, ${product.color || '#D4AF37'}22)` }}
          >
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 opacity-40 group-hover:opacity-100',
                wishlisted ? 'bg-red-500/90 text-white opacity-100' : 'bg-black/40 backdrop-blur-sm text-white/80 hover:text-red-400'
              )}
            >
              <Heart size={13} className={wishlisted ? 'fill-white' : ''} />
            </button>

            {discount > 0 && (
              <div className="absolute top-2.5 left-2.5 z-10 bg-accent text-[#050505] text-[11px] font-black px-2.5 py-1 rounded-full tracking-wide flex items-center gap-1">
                <span>{discount}%</span>
                <span className="text-[9px] opacity-80">OFF</span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              {product.images?.[0] && !imageError ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={product.images[0]}
                  alt={product.name}
                  width="400"
                  height="500"
                  className="h-full w-full object-contain drop-shadow-lg p-4"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl drop-shadow-lg">🧴</span>
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-1 sm:translate-y-0 sm:group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                className="w-full py-2 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-accent hover:text-[#050505] transition-colors duration-200"
              >
                <ShoppingBag size={12} /> Add to Cart
              </button>
            </div>
          </div>

          <div className="px-3 pt-2.5 pb-3">
            <h3 className="font-display text-[13px] font-bold text-white/90 mb-1 group-hover:text-accent transition-colors duration-300 leading-snug line-clamp-1">
              {product.name}
            </h3>

            {product.tags && product.tags.length > 0 && (
              <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full inline-block mb-1.5">
                {product.tags[0]}
              </span>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {hasReviews ? (
                  <>
                    <Star size={9} className="fill-accent text-accent" />
                    <span className="text-[10px] text-white/40">{product.rating || 5}</span>
                    <span className="text-[9px] text-white/25">({product.reviewCount} reviews)</span>
                  </>
                ) : (
                  <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">New</span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5">
                {product.pricing?.mrp > product.pricing?.sellingPrice && (
                  <span className="text-[10px] text-white/25 line-through">
                    ₹{(product.pricing.mrp).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[13px] font-bold text-white">
                  ₹{(product.pricing?.sellingPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
