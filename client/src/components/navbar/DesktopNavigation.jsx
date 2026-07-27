import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { navUnderlineVariants } from '@/lib/animations';
import { getNavigationAria } from '@/lib/accessibility';

/**
 * DesktopNavigation Component
 * Navigation links for desktop view
 */
export function DesktopNavigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="hidden lg:flex items-center gap-8 relative"
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          {...getNavigationAria({
            label: link.name,
            current: isActive(link.path),
          })}
          className={cn(
            'nav-link',
            isActive(link.path) && 'nav-link-active'
          )}
        >
          {link.name}
          {isActive(link.path) && (
            <motion.div
              layoutId="nav-underline"
              className="nav-underline"
              aria-hidden="true"
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
