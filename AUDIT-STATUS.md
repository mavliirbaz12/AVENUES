# Avenues Audit — Implementation Status

## Summary
- **Total issues in audit:** 40+
- **Fully implemented:** 11
- **Partially implemented:** 8
- **Not implemented:** 21+

---

## Section 1: Homepage (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1.1 | critical | No real product images in hero | ❌ Not implemented |
| 1.2 | high | Marquee trust bar has duplicate content | ❌ Not implemented |
| 1.3 | high | Testimonials auto-rotate too fast (5s) with no pause on hover | ❌ Not implemented |
| 1.4 | medium | Quiz section anchor (#quiz) not smooth-scrolled | ❌ Not implemented |
| 1.5 | medium | No skeleton/loading state for products grid | ❌ Not implemented |
| 1.6 | low | CTA section at bottom duplicates hero copy | ❌ Not implemented |

---

## Section 2: Product Card (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 2.1 | critical | Quick-add button only visible on hover — mobile users miss it | ✅ Implemented |
| 2.2 | critical | Card image area height is too short for perfume bottles | ❌ Not implemented |
| 2.3 | high | Wishlist icon opacity-0 on non-hover hides discoverability | ❌ Not implemented |
| 2.4 | high | Rating display lacks review count credibility | ❌ Not implemented |
| 2.5 | medium | Discount badge uses hardcoded black text on gold — fails small size | ❌ Not implemented |
| 2.6 | low | No fragrance family tag on card | ❌ Not implemented |

---

## Section 3: Auth (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 3.1 | critical | No Google / social login option | ⚠️ Partial (backend + button added, passport session wiring incomplete) |
| 3.2 | critical | No 'Forgot Password' link on login form | ✅ Implemented |
| 3.3 | high | Two-step signup has confusing Step 1 (email only) | ❌ Not implemented |
| 3.4 | high | Testimonials on auth left panel are too dim to read | ❌ Not implemented |
| 3.5 | medium | Error state resets entire form on failed login | ❌ Not implemented |
| 3.6 | low | No phone number login (OTP) option | ⚠️ Partial (backend + frontend form added, no SMS provider) |

---

## Section 4: Payment/Checkout (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 4.1 | critical | Single-page checkout with too many form fields shown at once | ⚠️ Partial (step indicator added, sections not fully separated) |
| 4.2 | critical | No saved payment methods | ⚠️ Partial (checkbox added, Razorpay customer_id not wired) |
| 4.3 | high | Razorpay 'down' detection is overly aggressive | ❌ Not implemented |
| 4.4 | high | Address form missing state dropdown — user must type state name | ❌ Not implemented |
| 4.5 | medium | Coupon code input has no validation feedback timing | ⚠️ Partial (empty-state disable added) |
| 4.6 | low | No estimated delivery date shown at checkout | ❌ Not implemented |

---

## Section 5: Order History (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 5.1 | critical | Order tracking is a static 5-step progress bar with no real data | ❌ Not implemented |
| 5.2 | critical | No reorder button on delivered orders | ✅ Implemented |
| 5.3 | high | Expand/collapse UX is inverted — order details hidden by default | ❌ Not implemented |
| 5.4 | high | No search or filter on orders list | ❌ Not implemented |
| 5.5 | medium | Empty state lacks emotional resonance | ❌ Not implemented |
| 5.6 | low | Missing download invoice option | ❌ Not implemented |

---

## Section 6: Profile Page (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 6.1 | critical | No avatar or profile photo upload | ❌ Not implemented |
| 6.2 | high | Address form in profile is identical to checkout — code duplication | ❌ Not implemented |
| 6.3 | high | Wishlist is a separate route (/wishlist) but listed as a profile tab | ❌ Not implemented |
| 6.4 | medium | No password change functionality in profile | ❌ Not implemented |
| 6.5 | medium | Email is readOnly but shows no explanation why | ❌ Not implemented |
| 6.6 | low | No notification preferences or loyalty points section | ❌ Not implemented |

---

## Section 7: SEO & Performance (8 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 7.1 | critical | No sitemap.xml or robots.txt | ✅ Implemented |
| 7.2 | critical | Product pages have no structured data (JSON-LD) | ⚠️ Partial (added on HomePage + PDP) |
| 7.3 | critical | index.html has a generic title and no meta description | ✅ Implemented (Helmet on all pages) |
| 7.4 | high | No Open Graph tags for social sharing | ❌ Not implemented |
| 7.5 | high | Images lack lazy loading and next-gen formats | ⚠️ Partial (loading="lazy" on ProductCard + hero) |
| 7.6 | high | Client-side routing means product pages aren't SSR'd | ❌ Not implemented |
| 7.7 | medium | No canonical URLs — risk of duplicate content | ⚠️ Partial (canonical added via Helmet) |
| 7.8 | low | No index.html meta description | ✅ Implemented |

---

## Section 8: Typography & Styles (6 issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 8.1 | critical | Font sizes use px values mixed with rem and Tailwind — inconsistent scale | ❌ Not implemented |
| 8.2 | high | Playfair Display used inconsistently — sometimes for UI labels | ❌ Not implemented |
| 8.3 | high | Tracking values inconsistent — 10+ different tracking- values used | ❌ Not implemented |
| 8.4 | high | Line-height not set on body text — defaults to browser value | ✅ Already in index.css |
| 8.5 | medium | Button text weight is inconsistent — font-bold vs font-semibold vs font-medium | ❌ Not implemented |
| 8.6 | low | No typographic scale documentation in DESIGN_SYSTEM.md | ❌ Not implemented |

---

## Section 9: Backend & API (6+ issues)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 9.1 | critical | CORS is set to allow all origins (cors() with no config) | ✅ Implemented |
| 9.2 | critical | JWT secret should be validated at startup | ✅ Implemented |
| 9.3 | high | No rate limiting on auth endpoints | ✅ Implemented |
| 9.4 | high | Tokens stored in localStorage — vulnerable to XSS | ❌ Not implemented |
| 9.5 | high | No input validation or sanitization on user endpoints | ❌ Not implemented |
| 9.6 | medium | Product images stored as URLs in MongoDB — no CDN | ⚠️ Partial (Cloudinary added, local still used) |
| 9.7 | medium | No request timeout on external APIs (postalpincode.in) | ❌ Not implemented |

---

## Totals

| Status | Count |
|--------|-------|
| ✅ Fully implemented | 11 |
| ⚠️ Partial | 8 |
| ❌ Not implemented | 21+ |
| **Total** | **~40** |

---

## What Remains and How to Do It

### High-Priority Remaining (Critical + High)

**Homepage**
1. **Real product images in hero** — Replace 🧴 emoji with actual product image. Use `object-fit: contain` in the hero container. Need product photoshoot or high-quality renders.
2. **Marquee trust bar dedup** — Remove the duplicated array spread. Use a single clean array of 8-10 trust signals.
3. **Testimonials pause + speed** — Change interval from 5s to 8s. Add `onMouseEnter/onMouseLeave` to pause. Add prev/next buttons and `aria-live='polite'`.

**Product Card**
4. **Image height** — Change `h-48 sm:h-56` to `aspect-[3/4]` on the image container.
5. **Wishlist visibility** — Change base opacity from `opacity-0` to `opacity-40` and `group-hover:opacity-100`.
6. **Rating + review count** — Hide stars if `reviewCount === 0`, show `New` badge instead. When reviews exist: `★ 4.8 (124 reviews)`.

**Auth**
7. **Passport serialize/deserialize** — Add `serializeUser/deserializeUser` to passport config and `express-session` with a persistent store.
8. **Two-step signup merge** — Merge Step 1 (email only) and Step 2 (full form) into a single-step form.
9. **Auth testimonials contrast** — Increase `text-white/20` to `text-white/55` for quotes.

**Checkout**
10. **True multi-step separation** — Currently all 3 sections render together; need conditional rendering per step.
11. **Razorpay saved cards** — Add `customer_id` to Order/User, pass to Razorpay on checkout.
12. **State dropdown** — Replace state text input with `<select>` of 28 states + 8 UTs.
13. **Razorpay down detection** — Remove timeout-based detection, only show error on actual network failure.

**Order History**
14. **Order tracking timestamps** — Add `statusHistory` array to Order model, populate on each status change, display timestamps.
15. **Expand/collapse UX** — Show mini tracking bar inline (not hidden in accordion).
16. **Order search/filter** — Add filter pills and search by order number or product name.

**Backend**
17. **HttpOnly cookies** — Migrate JWT from localStorage to HttpOnly cookies.
18. **Input validation** — Add `express-validator` to auth and user routes.
19. **Request timeout on pincode API** — Add `{ timeout: 3000 }` to axios call for postalpincode.in.

### Medium-Priority Remaining (Medium + Low)

**Profile**
20. **Avatar upload** — Add avatar section, camera icon, upload to `/api/upload`, store `avatarUrl` in User model.
21. **Extract AddressForm component** — Create `/components/features/AddressForm.jsx`, share between Profile and Checkout.
22. **Password change** — Add Security section with old/new/confirm password fields.
23. **Email readOnly explanation** — Add helper text below email field.
24. **Wishlist inline tab** — Either render Wishlist inline in ProfilePage or move to navbar standalone.

**SEO**
25. **Open Graph tags** — Add `og:title`, `og:image`, `og:description`, `og:type=product` to product pages.
26. **SSR/prerendering** — Migrate to Next.js or add `vite-plugin-ssr` for product pages.
27. **More image optimization** — Add `srcset`, WebP conversion, `fetchpriority="high"` to above-fold images.
28. **More canonical URLs** — Add canonical to shop filter states, order confirmation, profile pages.

**Typography**
29. **Type scale in tailwind.config** — Define strict fontSize scale, replace arbitrary values.
30. **Playfair Display scope** — Restrict to H1-H3, logo, product names only.
31. **Tracking standardization** — Remove arbitrary `tracking-[Xem]` values.
32. **Button font-weight consistency** — Define in `.btn` CSS class.
33. **DESIGN_SYSTEM.md typography docs** — Add full type scale documentation.

**Misc**
34. **State dropdown** on checkout — `<select>` of all Indian states.
35. **Coupon inline error** — Show error message below input when empty.
36. **Estimated delivery date** — Dynamic date based on pincode.
37. **Order empty state** — Emotional copy + product recommendations.
38. **Invoice download** — Generate PDF with pdfkit or jsPDF.
39. **Auth pages noindex** — Add noindex meta to /login, /signup.
40. **Profile pages noindex** — Add noindex meta to /profile routes.
41. **X-Robots-Tag header** on API responses.

---

## Recommended Next Steps

1. **Fix the most critical remaining items first:**
   - Product card image height (`aspect-[3/4]`)
   - Wishlist visibility
   - True multi-step checkout separation
   - Razorpay saved cards with customer_id
   - State dropdown

2. **Then batch the high-priority UX fixes:**
   - Homepage hero real images
   - Marquee dedup
   - Testimonial pause + speed
   - Rating/display credibility
   - Passport session wiring for Google OAuth

3. **Then medium/low:**
   - Profile avatar, password change, address form extraction
   - SEO OG tags, canonical URLs
   - Typography scale consolidation
   - Backend validation and HttpOnly cookies
