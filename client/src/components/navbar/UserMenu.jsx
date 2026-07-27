import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { useAuthModal } from '@/components/features/AuthModal';
import { dropdownVariants } from '@/lib/animations';
import { getButtonAria, getNavigationAria, useFocusTrap, announce } from '@/lib/accessibility';

/**
 * UserMenu Component
 * Dropdown menu for authenticated users
 */
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();

  // Focus trap for accessibility
  const menuRef = useFocusTrap(isOpen, () => setIsOpen(false));

  const handleLoginClick = () => {
    openLogin();
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    announce('You have been logged out successfully');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <button
        {...getButtonAria({
          label: 'Sign in',
          description: 'Click to open sign in modal',
        })}
        onClick={handleLoginClick}
        className="icon-btn"
      >
        <User size={20} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        {...getButtonAria({
          label: `User menu for ${user?.firstName || 'User'}`,
          expanded: isOpen,
          controls: 'user-menu-dropdown',
          hasPopup: true,
        })}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-full transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50',
          isOpen ? 'text-accent' : 'text-white hover:text-accent'
        )}
      >
        <User size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id="user-menu-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2 w-48 bg-[#111111] rounded-card shadow-luxury border border-white/10 overflow-hidden"
            role="menu"
            aria-label="User menu"
          >
            <div className="p-3 border-b border-white/10">
              <p className="font-medium text-sm text-white" role="menuitem">
                {user?.firstName || 'User'}
              </p>
              <p className="text-xs text-white/50">{user?.email || ''}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              {...getNavigationAria({ label: 'My Profile' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-accent hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-inset"
              role="menuitem"
            >
              <User size={14} aria-hidden="true" /> My Profile
            </Link>
            <Link
              to="/profile/orders"
              onClick={() => setIsOpen(false)}
              {...getNavigationAria({ label: 'My Orders' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-accent hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-inset"
              role="menuitem"
            >
              <ShoppingBag size={14} aria-hidden="true" /> My Orders
            </Link>
            <button
              onClick={handleLogout}
              {...getButtonAria({ label: 'Logout' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-inset"
              role="menuitem"
            >
              <LogOut size={14} aria-hidden="true" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
