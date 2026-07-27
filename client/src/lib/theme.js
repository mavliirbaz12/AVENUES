/**
 * Avenues Design System - Centralized Theme Configuration
 * This file contains all design tokens to ensure consistency across the application
 */

// ============================================
// COLOR TOKENS
// ============================================
export const colors = {
  // Primary palette
  primary: {
    DEFAULT: '#0F0F0F',
    50: '#f7f7f7',
    100: '#e3e3e3',
    200: '#c8c8c8',
    300: '#a4a4a4',
    400: '#818181',
    500: '#666666',
    600: '#515151',
    700: '#434343',
    800: '#383838',
    900: '#0F0F0F',
  },
  // Accent/Gold palette
  accent: {
    DEFAULT: '#D4AF37',
    50: '#FBF6E6',
    100: '#F5E9C0',
    200: '#EDDA96',
    300: '#E5CB6C',
    400: '#DCBE4D',
    500: '#D4AF37',
    600: '#C09A1E',
    700: '#9E7E19',
    800: '#7C6314',
    900: '#5A480F',
  },
  // Background colors
  background: {
    DEFAULT: '#050505',
    primary: '#050505',
    secondary: '#070707',
    tertiary: '#0D0D0D',
    card: '#111111',
    elevated: '#0A0A0A',
  },
  // Text colors
  text: {
    primary: '#F5F3F0',
    secondary: 'rgba(245, 243, 240, 0.8)',
    tertiary: 'rgba(245, 243, 240, 0.6)',
    muted: 'rgba(245, 243, 240, 0.4)',
    disabled: 'rgba(245, 243, 240, 0.3)',
  },
  // Border colors
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(255, 255, 255, 0.1)',
    lighter: 'rgba(255, 255, 255, 0.15)',
    accent: 'rgba(212, 175, 55, 0.3)',
  },
  // Status colors
  status: {
    success: '#22C55E',
    error: '#C41E3A',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

// ============================================
// TYPOGRAPHY TOKENS
// ============================================
export const typography = {
  fontFamily: {
    display: '"Playfair Display", Georgia, serif',
    body: 'Inter, system-ui, sans-serif',
    accent: 'Quicksand, sans-serif',
  },
  fontSize: {
    '2xs': '10px',
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
    '4xl': '24px',
    '5xl': '30px',
    '6xl': '36px',
    '7xl': '48px',
    '8xl': '60px',
    '9xl': '72px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.3,
    normal: 1.6,
    relaxed: 1.7,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================
// SPACING TOKENS
// ============================================
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// ============================================
// BORDER RADIUS TOKENS
// ============================================
export const borderRadius = {
  none: '0px',
  sm: '4px',
  DEFAULT: '8px',
  btn: '8px',
  md: '12px',
  card: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// ============================================
// SHADOW TOKENS
// ============================================
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  card: '0 4px 20px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 40px rgba(0, 0, 0, 0.15)',
  luxury: '0 20px 60px rgba(0, 0, 0, 0.15)',
  gold: '0 4px 20px rgba(212, 175, 55, 0.25)',
  'inner-gold': 'inset 0 0 30px rgba(212, 175, 55, 0.05)',
};

// ============================================
// TRANSITION TOKENS
// ============================================
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

// Button variants
export const buttonVariants = {
  primary: {
    background: colors.background.card,
    color: colors.text.primary,
    border: 'none',
    hover: {
      background: colors.accent.DEFAULT,
      color: colors.background.primary,
    },
  },
  secondary: {
    background: 'transparent',
    color: colors.text.primary,
    border: `2px solid ${colors.text.primary}`,
    hover: {
      background: colors.text.primary,
      color: colors.background.primary,
    },
  },
  accent: {
    background: colors.accent.DEFAULT,
    color: colors.background.primary,
    border: 'none',
    hover: {
      background: colors.accent[600],
    },
  },
  ghost: {
    background: 'transparent',
    color: colors.text.primary,
    border: 'none',
    hover: {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

// Card variants
export const cardVariants = {
  default: {
    background: colors.background.card,
    border: `1px solid ${colors.border.DEFAULT}`,
    borderRadius: borderRadius.card,
    shadow: shadows.card,
  },
  elevated: {
    background: colors.background.card,
    border: `1px solid ${colors.border.DEFAULT}`,
    borderRadius: borderRadius.card,
    shadow: shadows.luxury,
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.border.lighter}`,
    borderRadius: borderRadius.card,
  },
};

// Gradient definitions
export const gradients = {
  gold: 'linear-gradient(135deg, #D4AF37 0%, #F5E9C0 50%, #D4AF37 100%)',
  'gold-cta': 'linear-gradient(135deg, #C8A827 0%, #F5CC55 50%, #C8A827 100%)',
  luxury: 'linear-gradient(135deg, #050505 0%, #111111 50%, #050505 100%)',
  'text-gold': 'linear-gradient(135deg, #D4AF37, #F5E9C0, #D4AF37)',
  ambient: {
    top: 'radial-gradient(circle at 20% 15%, rgba(212, 175, 55, 0.06) 0%, transparent 50%)',
    bottom: 'radial-gradient(circle at 85% 90%, rgba(212, 175, 55, 0.04) 0%, transparent 40%)',
  },
};

// ============================================
// ACCESSIBILITY TOKENS
// ============================================
export const accessibility = {
  focusRing: {
    outline: '2px solid #D4AF37',
    outlineOffset: '2px',
  },
  reducedMotion: {
    transition: 'none',
    animation: 'none',
  },
  minTouchTarget: '44px',
  contentVisibility: 'auto',
};

// ============================================
// ANIMATION DURATIONS (in seconds for Framer Motion)
// ============================================
export const animationDurations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
  slowest: 1,
};

// ============================================
// EASING FUNCTIONS (for Framer Motion)
// ============================================
export const easingFunctions = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: [0.34, 1.56, 0.64, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
};

// ============================================
// DEFAULT EXPORT FOR CONVENIENCE
// ============================================
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  buttonVariants,
  cardVariants,
  gradients,
  accessibility,
  animationDurations,
  easingFunctions,
};
