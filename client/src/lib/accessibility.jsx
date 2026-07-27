/**
 * Accessibility Utilities
 * Comprehensive ARIA support, focus management, and accessibility helpers
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================
// FOCUS MANAGEMENT
// ============================================

/**
 * Trap focus within a modal/dialog element
 * @param {boolean} isActive - Whether the focus trap is active
 * @param {Function} onEscape - Callback when Escape key is pressed
 * @returns {Object} Ref to attach to the container element
 */
export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Store the element that had focus before the modal opened
      previousActiveElement.current = document.activeElement;
      
      // Focus the first focusable element in the container
      const container = containerRef.current;
      if (container) {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          container.focus();
        }
      }

      // Handle Tab key navigation
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
        
        if (e.key === 'Tab') {
          const focusableElements = getFocusableElements(containerRef.current);
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          // Shift + Tab on first element: move to last
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
          // Tab on last element: move to first
          else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        // Restore focus to the previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isActive, onEscape]);

  return containerRef;
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  if (!container) return [];
  
  const focusableSelectors = [
    'button:not([disabled]):not([tabindex="-1"])',
    'a[href]:not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]:not([tabindex="-1"])',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements).filter(el => {
    // Check if element is visible
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

// ============================================
// ARIA ATTRIBUTES
// ============================================

/**
 * Generate ARIA attributes for a button
 * @param {Object} options
 * @returns {Object}
 */
export function getButtonAria({ 
  label, 
  description,
  pressed,
  expanded,
  controls,
  hasPopup = false,
  disabled = false,
}) {
  return {
    'aria-label': label,
    'aria-describedby': description ? `${label}-description` : undefined,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
    'aria-controls': controls,
    'aria-haspopup': hasPopup,
    'aria-disabled': disabled,
  };
}

/**
 * Generate ARIA attributes for a navigation
 * @param {Object} options
 * @returns {Object}
 */
export function getNavigationAria({ 
  label,
  current = false,
  expanded = false,
}) {
  return {
    'aria-label': label,
    'aria-current': current ? 'page' : undefined,
    'aria-expanded': expanded,
  };
}

/**
 * Generate ARIA attributes for a modal/dialog
 * @param {Object} options
 * @returns {Object}
 */
export function getModalAria({ 
  title,
  description,
  labelledBy,
  describedBy,
}) {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelledBy || (title ? `${title}-title` : undefined),
    'aria-describedby': describedBy || (description ? `${title}-description` : undefined),
  };
}

/**
 * Generate ARIA attributes for a form field
 * @param {Object} options
 * @returns {Object}
 */
export function getFieldAria({ 
  id,
  label,
  required = false,
  invalid = false,
  errorMessage,
  describedBy,
}) {
  const describedByIds = [
    errorMessage ? `${id}-error` : null,
    describedBy,
  ].filter(Boolean).join(' ') || undefined;

  return {
    id,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': invalid,
    'aria-describedby': describedByIds,
  };
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

/**
 * Hook for keyboard navigation in lists
 * @param {number} itemCount - Number of items in the list
 * @param {Function} onSelect - Callback when an item is selected
 * @returns {Object} Navigation handlers and state
 */
export function useKeyboardNavigation(itemCount, onSelect) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < itemCount) {
          onSelect?.(focusedIndex);
        }
        break;
      default:
        break;
    }
  }, [itemCount, focusedIndex, onSelect]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

// ============================================
// SKIP LINKS
// ============================================

/**
 * Skip link component for keyboard navigation
 * Allows users to skip to main content
 */
export function SkipLink({ targetId, children = 'Skip to main content' }) {
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-50 focus:bg-accent focus:text-primary-900 
                 focus:px-4 focus:py-2 focus:rounded-btn focus:font-medium"
    >
      {children}
    </a>
  );
}

// ============================================
// ANNOUNCEMENTS (Screen Reader)
// ============================================

/**
 * Create a live region for dynamic announcements
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announce(message, priority = 'polite') {
  const liveRegion = document.getElementById(`live-region-${priority}`);
  if (liveRegion) {
    liveRegion.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * LiveRegion component for screen reader announcements
 */
export function LiveRegions() {
  return (
    <>
      <div
        id="live-region-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="live-region-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

// ============================================
// COLOR CONTRAST
// ============================================

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : [0, 0, 0];
}

// ============================================
// REDUCED MOTION
// ============================================

/**
 * Hook to detect user's motion preference
 * @returns {boolean} Whether user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation props based on motion preference
 * @param {boolean} prefersReducedMotion
 * @param {Object} fullAnimation - Full animation config
 * @param {Object} reducedAnimation - Reduced animation config
 * @returns {Object}
 */
export function getAccessibleAnimation(prefersReducedMotion, fullAnimation, reducedAnimation = {}) {
  if (prefersReducedMotion) {
    return {
      ...fullAnimation,
      ...reducedAnimation,
      transition: { duration: 0 },
    };
  }
  return fullAnimation;
}

// ============================================
// ACCESSIBILITY CHECKS
// ============================================

/**
 * Check if element is in viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Hook to announce page changes to screen readers
 */
export function usePageAnnouncement(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Avenues`;
      announce(`Navigated to ${title}`);
    }
  }, [title]);
}

// ============================================
// SEMANTIC HTML HELPERS
// ============================================

/**
 * Generate heading level attributes
 * @param {number} level - Heading level (1-6)
 * @returns {Object}
 */
export function getHeadingProps(level) {
  const validLevel = Math.min(Math.max(level, 1), 6);
  return {
    role: 'heading',
    'aria-level': validLevel,
  };
}

/**
 * Generate list attributes
 * @param {number} itemCount
 * @returns {Object}
 */
export function getListAria(itemCount) {
  return {
    role: 'list',
    'aria-setsize': itemCount,
  };
}

/**
 * Generate list item attributes
 * @param {number} index
 * @returns {Object}
 */
export function getListItemAria(index) {
  return {
    role: 'listitem',
    'aria-posinset': index + 1,
  };
}
