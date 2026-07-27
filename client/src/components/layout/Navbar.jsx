import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUIStore from '@/store/uiStore';
import { DesktopNavigation } from '@/components/navbar/DesktopNavigation';
import { SearchBar } from '@/components/navbar/SearchBar';
import { MobileMenu } from '@/components/navbar/MobileMenu';
import { UserMenu } from '@/components/navbar/UserMenu';
import { CartButton, WishlistButton } from '@/components/navbar/ActionButtons';
import { getButtonAria, SkipLink } from '@/lib/accessibility';

const HEADER_HEIGHT = 70;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
  }, []);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;

    setScrolled(currentY > 20);

    if (currentY < HEADER_HEIGHT) {
      setHidden(false);
    } else if (currentY > lastScrollY.current + 3) {
      setHidden(true);
    } else if (currentY < lastScrollY.current - 3) {
      setHidden(false);
    }

    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    closeMobileMenu();
    setSearchOpen(false);
  }, [location.pathname, closeMobileMenu]);

  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <>
      <SkipLink targetId="main-content" />

      <header
        role="banner"
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-transform duration-500 ease-[cubic-bezier(0.6,0,0.4,1)]',
          hidden && !searchOpen && !isMobileMenuOpen && 'navbar-hidden',
          scrolled || searchOpen
            ? 'bg-[#050505]/90 backdrop-blur-md shadow-lg py-2 border-b border-white/5'
            : 'bg-transparent py-3'
        )}
      >
        <nav
          className="container-luxury flex items-center justify-between"
          role="navigation"
          aria-label="Primary navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
            aria-label="Avenues Home"
          >
            <img
              src="/logo.png"
              alt="Avenues"
              className="h-10 sm:h-12 object-contain group-hover:brightness-110 transition-all duration-300"
              style={{ mixBlendMode: 'lighten' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <button
              {...getButtonAria({
                label: searchOpen ? 'Close search' : 'Open search',
                pressed: searchOpen,
              })}
              onClick={toggleSearch}
              className={cn(
                'icon-btn',
                searchOpen && 'bg-white/10 text-accent'
              )}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Wishlist */}
            <WishlistButton />

            {/* Cart */}
            <CartButton />

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu Toggle */}
            <button
              {...getButtonAria({
                label: isMobileMenuOpen ? 'Close menu' : 'Open menu',
                expanded: isMobileMenuOpen,
                controls: 'mobile-menu',
                hasPopup: true,
              })}
              onClick={toggleMobileMenu}
              className="icon-btn lg:hidden"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Search Bar */}
        <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            id="mobile-menu"
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}
