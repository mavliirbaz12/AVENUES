# Avenues Design System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Accessibility](#accessibility)
5. [Animations](#animations)
6. [Best Practices](#best-practices)

## Overview

The Avenues Design System is a comprehensive UI/UX framework built for the premium men's fragrance e-commerce platform. It provides a consistent, accessible, and performant user experience across all devices.

### Philosophy
- **Premium Feel**: Dark luxury theme with gold accents
- **Accessibility First**: WCAG 2.1 AA compliant
- **Performance**: Optimized loading and animations
- **Maintainability**: Centralized tokens and reusable components

## Design Tokens

All design tokens are centralized in `/src/lib/theme.js`:

### Colors
```javascript
import { colors } from '@/lib/theme';

// Usage
<div className="text-accent" />                    // Primary accent
<div className="bg-[#050505]" />                   // Background
<div className="text-white/80" />                  // Secondary text
```

### Typography
```javascript
import { typography } from '@/lib/theme';

// Font families
font-display  // Playfair Display - Headings
font-body     // Inter - Body text
font-accent   // Quicksand - Special elements
```

### Spacing
Consistent spacing scale from 0.5 (2px) to 96 (384px)

### Shadows
- `shadow-card`: Default card elevation
- `shadow-luxury`: Elevated components
- `shadow-gold`: Gold-tinted shadows for CTAs

## Component Library

### Buttons

All buttons use centralized classes:

```jsx
// Primary Button
<button className="btn-primary">Click me</button>

// Secondary Button
<button className="btn-secondary">Cancel</button>

// CTA Button (with gold gradient)
<button className="btn-cta">Shop Now</button>

// Outline Button
<button className="btn-outline">Learn More</button>
```

### Cards

```jsx
// Luxury Card (hover effects)
<div className="card-luxury">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Glass Card
<div className="card-glass">
  <p>Glass morphism effect</p>
</div>
```

### Forms

```jsx
// Luxury Input
<input className="input-luxury" placeholder="Enter text..." />

// With error state
<input className="input-luxury input-error" />
```

### Badges

```jsx
<span className="badge-accent">New</span>
<span className="badge-success">In Stock</span>
<span className="badge-gold">50% OFF</span>
```

## Accessibility

### Focus Management
All interactive elements have visible focus states:

```jsx
import { useFocusTrap } from '@/lib/accessibility';

function Modal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen, onClose);
  
  return (
    <div ref={containerRef}>
      {/* Modal content */}
    </div>
  );
}
```

### ARIA Attributes
```jsx
import { getButtonAria, getNavigationAria } from '@/lib/accessibility';

<button {...getButtonAria({ label: 'Close', expanded: false })}>
  <X />
</button>
```

### Screen Reader Support
- All images have descriptive alt text
- Form inputs have associated labels
- Live regions for dynamic content
- Skip link for keyboard navigation

### Reduced Motion
```jsx
import { useReducedMotion } from '@/lib/accessibility';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
    />
  );
}
```

## Animations

### Reusable Variants
All animations are centralized in `/src/lib/animations.js`:

```jsx
import { fadeUpVariants, scaleVariants } from '@/lib/animations';

<motion.div
  variants={fadeUpVariants}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

### Common Patterns

#### Fade Up (Scroll-triggered)
```jsx
import { fadeUpVariants, viewportSettings } from '@/lib/animations';

<motion.div
  variants={fadeUpVariants}
  initial="hidden"
  whileInView="visible"
  viewport={viewportSettings}
>
  Content appears on scroll
</motion.div>
```

#### Stagger Animation (Lists)
```jsx
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';

<motion.div variants={staggerContainerVariants}>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

#### Modal Animation
```jsx
import { modalContentVariants, modalOverlayVariants } from '@/lib/animations';

<>
  <motion.div variants={modalOverlayVariants} className="overlay" />
  <motion.div variants={modalContentVariants} className="modal">
    Content
  </motion.div>
</>
```

## Best Practices

### Do's ✓

1. **Use Design Tokens**
   ```jsx
   // ✓ Good
   <div className="text-accent" />
   
   // ✗ Avoid
   <div className="text-[#D4AF37]" />
   ```

2. **Use Animation Variants**
   ```jsx
   // ✓ Good
   import { fadeUpVariants } from '@/lib/animations';
   <motion.div variants={fadeUpVariants} />
   
   // ✗ Avoid
   <motion.div animate={{ opacity: 0, y: 20 }} />
   ```

3. **Implement Accessibility**
   ```jsx
   // ✓ Good
   <button aria-label="Close menu" onClick={onClose}>
     <X />
   </button>
   
   // ✗ Avoid
   <button onClick={onClose}>
     <X />
   </button>
   ```

4. **Use Skeleton Loading**
   ```jsx
   import { SkeletonCard, SkeletonGrid } from '@/components/ui/Skeleton';
   
   {isLoading ? (
     <SkeletonGrid count={4} />
   ) : (
     <ProductGrid products={products} />
   )}
   ```

5. **Lazy Load Images**
   ```jsx
   import { LazyImage } from '@/components/ui/LazyImage';
   
   <LazyImage
     src={product.image}
     alt={product.name}
     aspectRatio="aspect-square"
   />
   ```

### Don'ts ✗

1. **Avoid Inline Styles**
   ```jsx
   // ✗ Don't
   <button style={{ background: 'linear-gradient(...)' }} />
   
   // ✓ Do
   <button className="btn-cta" />
   ```

2. **Avoid Magic Numbers**
   ```jsx
   // ✗ Don't
   <div className="mt-[47px]" />
   
   // ✓ Do
   <div className="mt-12" /> // or mt-10, mt-14
   ```

3. **Avoid Hardcoded Colors**
   ```jsx
   // ✗ Don't
   <div className="text-[#D4AF37]" />
   
   // ✓ Do
   <div className="text-accent" />
   ```

## File Structure

```
/src
  /components
    /features
      AuthModal.jsx
      CartDrawer.jsx
      ProductCard.jsx
      QuizSection.jsx
    /layout
      Navbar.jsx          # Refactored
      Footer.jsx
      CustomerLayout.jsx
      AdminLayout.jsx
    /navbar             # NEW: Navbar subcomponents
      SearchBar.jsx
      MobileMenu.jsx
      UserMenu.jsx
      ActionButtons.jsx
      DesktopNavigation.jsx
    /ui                 # NEW: Reusable UI components
      Skeleton.jsx      # Loading states
      LazyImage.jsx     # Image optimization
      ErrorBoundary.jsx # Error handling
  /lib
    theme.js            # NEW: Design tokens
    animations.js       # NEW: Animation variants
    accessibility.js    # NEW: A11y utilities
  /pages
    /customer
      HomePage.jsx
      ShopPage.jsx
      ProductDetailPage.jsx
      CartPage.jsx
      WishlistPage.jsx
      CheckoutPage.jsx
      ProfilePage.jsx
      AboutPage.jsx     # NEW: Proper location
```

## Component Checklist

Before submitting new components, verify:

- [ ] Uses design tokens from `theme.js`
- [ ] Uses animation variants from `animations.js`
- [ ] Implements proper accessibility (ARIA, focus states)
- [ ] Has loading state (skeleton)
- [ ] Has error state (error boundary)
- [ ] Supports reduced motion preference
- [ ] Properly typed with PropTypes/TypeScript
- [ ] Documented with JSDoc comments
- [ ] Responsive on all breakpoints
- [ ] Tested for color contrast

## Migration Guide

### From Old to New Button Styles

```jsx
// Before
<button
  className="px-6 py-3 bg-white text-black rounded"
  style={{ background: 'linear-gradient(...)' }}
>
  CTA
</button>

// After
<button className="btn-cta">
  CTA
</button>
```

### From Old to New Animation

```jsx
// Before
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
>

// After
<motion.div variants={fadeUpVariants}>
```

## Performance Tips

1. **Use `will-change` sparingly**
2. **Lazy load images below the fold**
3. **Use CSS transitions over JS animations where possible**
4. **Implement virtualization for long lists**
5. **Use `React.memo` for pure components**
6. **Code split large pages**

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

---

## Contributing

When contributing to the design system:

1. Add new tokens to `theme.js` first
2. Create new animation variants in `animations.js`
3. Document accessibility requirements
4. Test with screen readers
5. Update this documentation

## Contact

For questions about the design system, contact the UI/UX team.
