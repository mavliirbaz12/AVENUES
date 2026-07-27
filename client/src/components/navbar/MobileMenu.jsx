import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, User, X, Menu, LogOut } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { useAuthModal } from '@/components/features/AuthModal';
import { mobileMenuVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { getButtonAria, getNavigationAria, useFocusTrap, announce } from '@/lib/accessibility';

/**
 * MobileMenu Component
 * Full-screen mobile navigation with accessibility
 */
export function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { openLogin } = useAuthModal();

  const isActive = (path) => location.pathname === path;

  // Focus trap for accessibility
  const menuRef = useFocusTrap(isOpen, onClose);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    announce('You have been logged out successfully');
  };

  const handleLoginClick = () => {
    closeMobileMenu();
    openLogin();
  };

  return (
    <motion.div
      ref={menuRef}
      variants={mobileMenuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-40 bg-[#050505] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="pt-24 px-6 space-y-6">
        <motion.nav
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
          role="navigation"
          aria-label="Main mobile navigation"
        >
          {NAV_LINKS.map((link, index) => (
            <motion.div key={link.path} variants={staggerItemVariants}>
              <Link
                to={link.path}
                onClick={closeMobileMenu}
                {...getNavigationAria({
                  label: link.name,
                  current: isActive(link.path),
                })}
                className={cn(
                  'block text-3xl font-display font-semibold py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 rounded px-2 -mx-2',
                  isActive(link.path) ? 'text-accent' : 'text-white'
                )}
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <hr className="border-white/10" aria-hidden="true" />

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {!isAuthenticated ? (
            <motion.div variants={staggerItemVariants}>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="btn-accent text-[#050505] font-bold block text-center py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div variants={staggerItemVariants} className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <span className="text-accent font-bold">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{user?.firstName || 'User'}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
              </motion.div>
              <motion.div variants={staggerItemVariants}>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="block text-xl text-white/80 hover:text-accent py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded px-2 -mx-2"
                >
                  My Profile
                </Link>
              </motion.div>
              <motion.div variants={staggerItemVariants}>
                <Link
                  to="/profile/orders"
                  onClick={closeMobileMenu}
                  className="block text-xl text-white/80 hover:text-accent py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded px-2 -mx-2"
                >
                  My Orders
                </Link>
              </motion.div>
              <motion.div variants={staggerItemVariants}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xl text-red-500 hover:text-red-400 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded px-2 -mx-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
