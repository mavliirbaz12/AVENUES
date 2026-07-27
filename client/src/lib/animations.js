/**
 * Animation Variants - Centralized Framer Motion configurations
 * Ensures consistent animations across the application
 */

import { animationDurations, easingFunctions } from './theme';

// ============================================
// FADE ANIMATIONS
// ============================================
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationDurations.fast,
      ease: easingFunctions.standard,
    },
  },
};

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: animationDurations.fast,
      ease: easingFunctions.standard,
    },
  },
};

export const fadeDownVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

export const fadeLeftVariants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
};

export const fadeRightVariants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
};

// ============================================
// SCALE ANIMATIONS
// ============================================
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

export const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.spring,
    },
  },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================
export const slideDownVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
};

export const slideFromRightVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: animationDurations.fast,
      ease: easingFunctions.standard,
    },
  },
};

export const slideFromLeftVariants = {
  hidden: { opacity: 0, x: '-100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: '-100%',
    transition: {
      duration: animationDurations.fast,
    },
  },
};

// ============================================
// STAGGER ANIMATIONS (for lists)
// ============================================
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.smooth,
    },
  },
};

export const staggerFastVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ============================================
// HERO SECTION ANIMATIONS
// ============================================
export const heroTextVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slower,
      delay: custom * 0.15,
      ease: easingFunctions.smooth,
    },
  }),
};

export const heroButtonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slower,
      delay: 0.6,
      ease: easingFunctions.smooth,
    },
  },
};

// ============================================
// CARD ANIMATIONS
// ============================================
export const cardHoverVariants = {
  rest: {
    y: 0,
    scale: 1,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.spring,
    },
  },
};

export const cardImageHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.07,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.smooth,
    },
  },
};

// ============================================
// MODAL/DIALOG ANIMATIONS
// ============================================
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: animationDurations.normal,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

export const bottomSheetVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: animationDurations.fast,
    },
  },
};

// ============================================
// DROPDOWN MENU ANIMATIONS
// ============================================
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: animationDurations.fast,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

// ============================================
// NAVIGATION ANIMATIONS
// ============================================
export const navUnderlineVariants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
};

export const mobileMenuVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: animationDurations.fast,
      ease: easingFunctions.standard,
    },
  },
};

// ============================================
// SCROLL-BASED ANIMATIONS
// ============================================
export const scrollFadeInVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.smooth,
    },
  },
};

// ============================================
// PRODUCT CARD ANIMATIONS
// ============================================
export const productCardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      delay: index * 0.08,
      ease: easingFunctions.smooth,
    },
  }),
};

// ============================================
// TESTIMONIAL ANIMATIONS
// ============================================
export const testimonialVariants = {
  enter: { opacity: 0, y: 12 },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

// ============================================
// FLOATING ANIMATIONS (continuous)
// ============================================
export const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowAnimation = {
  boxShadow: [
    '0 0 20px rgba(212, 175, 55, 0.1)',
    '0 0 40px rgba(212, 175, 55, 0.3)',
    '0 0 20px rgba(212, 175, 55, 0.1)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// PAGE TRANSITIONS
// ============================================
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.slow,
      ease: easingFunctions.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: animationDurations.fast,
    },
  },
};

// ============================================
// SPRING CONFIGURATIONS
// ============================================
export const springConfigs = {
  gentle: { stiffness: 100, damping: 15 },
  standard: { stiffness: 300, damping: 30 },
  stiff: { stiffness: 500, damping: 50 },
  bounce: { stiffness: 400, damping: 10 },
};

// ============================================
// VIEWPORT SETTINGS (for scroll animations)
// ============================================
export const viewportSettings = {
  once: true,
  margin: '-60px',
  amount: 0.3,
};

export const viewportSettingsSmall = {
  once: true,
  margin: '-40px',
  amount: 0.2,
};

// ============================================
// REDUCED MOTION SUPPORT
// ============================================
export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.01 },
  },
};
