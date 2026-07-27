import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import { scaleVariants } from '@/lib/animations';
import { getButtonAria, getNavigationAria } from '@/lib/accessibility';

/**
 * CartButton Component
 * Cart trigger with item count badge
 */
export function CartButton() {
  const cartItems = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.openCart);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      {...getButtonAria({
        label: `Shopping cart with ${itemCount} items`,
        description: 'Click to open cart drawer',
      })}
      onClick={toggleCart}
      className="icon-btn relative"
    >
      <ShoppingBag size={20} />
      {itemCount > 0 && (
        <motion.span
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="badge-count"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </button>
  );
}

/**
 * WishlistButton Component
 * Wishlist link with item count badge
 */
export function WishlistButton() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const hasItems = wishlistItems.length > 0;

  return (
    <Link
      to="/wishlist"
      {...getNavigationAria({
        label: `Wishlist with ${wishlistItems.length} items`,
      })}
      className="icon-btn relative"
    >
      <Heart
        size={20}
        className={cn(hasItems && 'fill-accent text-accent')}
        aria-hidden="true"
      />
      {hasItems && (
        <motion.span
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="badge-count"
          aria-hidden="true"
        >
          {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
        </motion.span>
      )}
    </Link>
  );
}
