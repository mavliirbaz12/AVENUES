import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useWishlistStore from '@/store/wishlistStore';
import ProductCard from '@/components/features/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
    <>
      <Helmet>
        <title>Wishlist | Avenues Perfume</title>
        <meta name="description" content="Your saved favorites at Avenues Perfume." />
        <link rel="canonical" href="https://avenues.in/wishlist" />
        <meta property="og:title" content="Wishlist | Avenues Perfume" />
        <meta property="og:description" content="Your saved favorites at Avenues Perfume." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avenues.in/wishlist" />
        <meta property="og:image" content="https://avenues.in/og-wishlist.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Heart size={64} className="text-white/20 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Nothing saved yet</h2>
          <p className="text-white/60 mb-6">Find a scent you love and save it for later.</p>
          <Link to="/shop" className="btn-accent text-primary-900 font-bold inline-block px-8 py-3 rounded-full">Browse Scents</Link>
        </motion.div>
       </div>
       </>
     );
   }

  return (
    <>
      <Helmet>
        <title>Wishlist | Avenues Perfume</title>
        <meta name="description" content="Your saved favorites at Avenues Perfume." />
        <link rel="canonical" href="https://avenues.in/wishlist" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Wishlist | Avenues Perfume" />
        <meta property="og:description" content="Your saved favorites at Avenues Perfume." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avenues.in/wishlist" />
        <meta property="og:image" content="https://avenues.in/og-wishlist.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="container-luxury">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white">My Wishlist ({items.length})</h1>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
