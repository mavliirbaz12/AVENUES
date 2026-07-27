import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Avenues Intense',
    slug: 'avenues-intense',
    categoryLabel: 'eau de parfum for men',
    heroTagline: 'BOLD. FRESH. POWERFUL.',
    tagline: 'Bold. Fresh. Powerful.',
    oneLiner: 'Smells like confidence in a bottle.',
    shortDescription: 'Fresh citrus up top. Woody warmth underneath. Built for the man who walks into a room and owns it.',
    longDescription: 'AVENUES INTENSE opens with bergamot that hits you first — crisp, clean, unmistakable. Then lavender softens the edges. The heart warms up with orange blossom and geranium, adding something floral but not sweet. Then it settles. Amber and cedarwood take over — deep, woody, masculine. This is not a fragrance that fades quietly. 8-10 hours. It stays. And so do you.',
    description: 'Fresh citrus up top. Woody warmth underneath. Built for the man who walks into a room and owns it.',
    images: [],
    pricing: { mrp: 1499, sellingPrice: 1199, discount: 20 },
    fragrance: {
      topNotes: ['Bergamot', 'Lavender'],
      heartNotes: ['Orange Blossom', 'Geranium'],
      baseNotes: ['Amber', 'Cedarwood'],
      longevity: '8-10',
      projection: 'strong',
      size: '50ml',
      for: 'men',
    },
    benefits: [
      '8-10 hours of wear. Still going strong after your workday.',
      'Opens bright, dries down warm. Two scents in one.',
      'Bergamot + cedarwood — a combo that never misses.',
      'Perfect for office, dates, or just feeling good in your own skin.',
      'No compliments guaranteed. Actually, yes they are.',
    ],
    faqs: [
      { q: 'How long does Avenues Intense last?', a: "8-10 hours on skin. It's an EDP, not a body spray — the concentration does the work." },
      { q: 'Is it good for daily wear?', a: "Perfect for the office, errands, lunch meetings. It's bold but not loud." },
      { q: 'What season is this for?', a: 'Year-round. The citrus top works in summer, the woody base works in winter.' },
      { q: 'Will I get compliments?', a: "Let's just say we didn't get 128 reviews by being forgettable." },
    ],
    usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
    occasions: ['Daily Wear', 'Office', 'Parties'],
    type: 'Eau De Parfum (EDP)',
    tags: ['Fresh', 'Woody', 'Bold'],
    rating: 4.5,
    reviewCount: 128,
    stock: { quantity: 50, lowStockThreshold: 10 },
    color: '#2C3E50',
  },
  {
    name: 'Avenues Pink Aura',
    slug: 'avenues-pink-aura',
    categoryLabel: 'eau de parfum for men',
    heroTagline: 'ELEGANT. REFINED. UNMISTAKABLE.',
    tagline: 'Elegant. Refined. Unmistakable.',
    oneLiner: "Florals that don't scream. Wood that doesn't hide.",
    shortDescription: 'Peony and rose up front. Sandalwood and patchouli underneath. Elegant without trying.',
    longDescription: 'AVENUES PINK AURA starts with peony — bright, floral, but never loud. Citrus adds a sparkle. Then the heart blooms: rose and osmanthus together, floral but grounded. As it dries, sandalwood and patchouli come forward — warm, woody, sophisticated. This is the fragrance you wear when you want to be noticed without saying a word. 8-10 hours of quiet confidence.',
    description: 'Peony and rose up front. Sandalwood and patchouli underneath. Elegant without trying.',
    images: [],
    pricing: { mrp: 1499, sellingPrice: 1299, discount: 13 },
    fragrance: {
      topNotes: ['Peony', 'Citrus Accords'],
      heartNotes: ['Rose', 'Osmanthus'],
      baseNotes: ['Sandalwood', 'Patchouli'],
      longevity: '8-10',
      projection: 'moderate',
      size: '50ml',
      for: 'men',
    },
    benefits: [
      '8-10 hours. Starts floral, ends woody. A journey in a bottle.',
      'Peony + rose + osmanthus. A floral trio that actually works for men.',
      'Subtle enough for the office. Memorable enough for date night.',
      'Sandalwood base keeps it masculine, never sweet or cloying.',
      'The kind of scent people lean in closer to catch.',
    ],
    faqs: [
      { q: 'Is this too floral for men?', a: 'Not at all. The sandalwood and patchouli base balances the florals perfectly.' },
      { q: 'How long does it last?', a: '8-10 hours easy. The floral top fades after 2 hours, the woody base stays all day.' },
      { q: 'Best occasion for this?', a: 'Date nights, weddings, dinners. Anything where you want to be remembered.' },
      { q: 'Can I wear this daily?', a: "Absolutely. It's elegant enough for special occasions but subtle enough for everyday." },
    ],
    usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
    occasions: ['Dates', 'Special Occasions', 'Evening'],
    type: 'Eau De Parfum (EDP)',
    tags: ['Floral', 'Woody', 'Elegant'],
    rating: 4.7,
    reviewCount: 95,
    stock: { quantity: 35, lowStockThreshold: 10 },
    color: '#C77986',
  },
  {
    name: 'Avenues Night Drip',
    slug: 'avenues-night-drip',
    categoryLabel: 'eau de parfum for men',
    heroTagline: 'SWEET. SEDUCTIVE. UNFORGETTABLE.',
    tagline: 'Sweet. Seductive. Unforgettable.',
    oneLiner: 'The one they remember the next morning.',
    shortDescription: 'Apple and cinnamon that hit warm. Vanilla and amber that stay. Night in a bottle.',
    longDescription: "AVENUES NIGHT DRIP doesn't ask for attention — it takes it. The opening hits with crisp apple and warm cinnamon, like walking into a dimly lit lounge. At the heart, orange blossom softens the edge, adding a floral warmth that feels intimate. Then the base settles in — rich vanilla, tonka bean, and deep amber wrap around you like velvet. 10-12 hours of wear. Not for the faint-hearted.",
    description: 'Apple and cinnamon that hit warm. Vanilla and amber that stay. Night in a bottle.',
    images: [],
    pricing: { mrp: 1499, sellingPrice: 1199, discount: 20 },
    fragrance: {
      topNotes: ['Apple', 'Cinnamon'],
      heartNotes: ['Orange Blossom'],
      baseNotes: ['Vanilla', 'Tonka Bean', 'Amber'],
      longevity: '10-12+',
      projection: 'strong',
      size: '50ml',
      for: 'men',
    },
    benefits: [
      '10-12+ hours. Still there at 2 AM. We tested it.',
      "25% oil concentration. This isn't your regular EDT.",
      'Built on real customer feedback, not boardroom guesses.',
      'Sweet-spicy blend that works on every skin type we tested.',
      'The kind that gets you asked "What are you wearing?" — repeatedly.',
    ],
    faqs: [
      { q: 'How long does Night Drip last?', a: "10-12+ hours on skin. It's a parfum concentration — a little goes a long way." },
      { q: 'Is it good for dates?', a: "It's literally designed for nights out. Sweet, warm, impossible to ignore." },
      { q: 'Can I wear it in summer?', a: 'Best for evenings and cooler weather. For summer, try Avenues Blue Mist instead.' },
      { q: 'Is this suitable for sensitive skin?', a: 'Made with skin-friendly ingredients. If you have allergies, do a patch test first.' },
    ],
    usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
    occasions: ['Night Out', 'Parties', 'Dates'],
    type: 'Eau De Parfum (EDP)',
    tags: ['Sweet', 'Spicy', 'Warm'],
    rating: 4.8,
    reviewCount: 156,
    stock: { quantity: 25, lowStockThreshold: 10 },
    color: '#1A1A2E',
  },
  {
    name: 'Avenues Blue Mist',
    slug: 'avenues-blue-mist',
    categoryLabel: 'eau de parfum for men',
    heroTagline: 'FRESH. CLEAN. EVERYDAY.',
    tagline: 'Fresh. Clean. Everyday.',
    oneLiner: 'Your daily driver. No overthinking required.',
    shortDescription: 'Aquatic and citrusy. Clean without being boring. The one you reach for every morning.',
    longDescription: 'AVENUES BLUE MIST is what you grab when you want to smell good without a second thought. Citrus and fresh aquatic notes hit first — clean, crisp, like a cold shower on a warm morning. Marine and floral notes add depth in the heart, keeping it interesting but never heavy. The base settles into musk and woody tones — subtle enough for the office, fresh enough for a weekend lunch. 8-10 hours. Simple. Effective. Reliable.',
    description: 'Aquatic and citrusy. Clean without being boring. The one you reach for every morning.',
    images: [],
    pricing: { mrp: 1299, sellingPrice: 999, discount: 23 },
    fragrance: {
      topNotes: ['Citrus', 'Fresh Aquatic'],
      heartNotes: ['Marine', 'Floral'],
      baseNotes: ['Musk', 'Woody'],
      longevity: '8-10',
      projection: 'moderate',
      size: '50ml',
      for: 'men',
    },
    benefits: [
      '8-10 hours. One spray at 7 AM, still fresh at 5 PM.',
      'Aquatic + citrus. The cleanest combo in the game. Period.',
      'Light enough for summer. Fresh enough for every single day.',
      "Office-safe. Won't announce you before you walk through the door.",
      'Best value in the lineup. 999. Your wallet will thank you.',
    ],
    faqs: [
      { q: 'How long does Blue Mist last?', a: "8-10 hours on skin. It's lighter than our other scents but still holds up all day." },
      { q: 'Is this a summer scent?', a: 'Perfect for summer. The aquatic and citrus notes thrive in heat and humidity.' },
      { q: 'Can I wear this to the office?', a: "Ideal for office wear. Fresh, clean, and won't overpower a meeting room." },
      { q: 'How is this different from Intense?', a: 'Blue Mist is lighter and fresher. Intense is warmer and bolder. Think day vs evening.' },
    ],
    usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
    occasions: ['Daily Wear', 'Office', 'Casual'],
    type: 'Eau De Parfum (EDP)',
    tags: ['Fresh', 'Aquatic', 'Clean'],
    rating: 4.4,
    reviewCount: 89,
    stock: { quantity: 60, lowStockThreshold: 10 },
    color: '#3498DB',
  },
  {
    name: 'Avenues White Oud',
    slug: 'avenues-white-oud',
    categoryLabel: 'eau de parfum for men',
    heroTagline: 'RICH. REGAL. TIMELESS.',
    tagline: 'Rich. Regal. Timeless.',
    oneLiner: "Oud and saffron. Because you've earned it.",
    shortDescription: 'Saffron and oud. Warm amber and musk. This is not a daily driver. This is a statement.',
    longDescription: 'AVENUES WHITE OUD opens with saffron — warm, spicy, unmistakably luxurious. Spicy accords dance around it, building anticipation. In the heart, rose meets oud — floral meets dark, rich wood. Traditional. Powerful. The base is amber and musk — warm, deep, lasting. This is not a subtle fragrance. It announces itself. 10-12+ hours. White Oud is the one you wear when the occasion demands respect.',
    description: 'Saffron and oud. Warm amber and musk. This is not a daily driver. This is a statement.',
    images: [],
    pricing: { mrp: 1499, sellingPrice: 1399, discount: 7 },
    fragrance: {
      topNotes: ['Saffron', 'Spicy Accords'],
      heartNotes: ['Rose', 'Oud'],
      baseNotes: ['Amber', 'Musk'],
      longevity: '10-12+',
      projection: 'strong',
      size: '50ml',
      for: 'men',
    },
    benefits: [
      '10-12+ hours. One spray at 6 PM. Still going at 6 AM.',
      'Real oud. Not the synthetic kind you find in cheap alternatives.',
      'Saffron + rose + oud. A classic Middle Eastern profile, done right.',
      'Not for everyday. Save it for moments that actually matter.',
      'Wear this and people will assume you own the room.',
    ],
    faqs: [
      { q: 'How long does White Oud last?', a: "10-12+ hours on skin. It's our strongest concentration. One spray is enough." },
      { q: 'Is this for everyday wear?', a: "We don't recommend it. White Oud is for events, evenings, and moments that call for presence." },
      { q: "What's the difference between this and Night Drip?", a: 'Night Drip is sweet and playful. White Oud is rich and commanding. Different moods, same quality.' },
      { q: 'Is oud too strong for beginners?', a: "This is a great introduction to oud. It's rich but balanced — not the harsh oud you may have tried before." },
    ],
    usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
    occasions: ['Special Events', 'Evening Wear', 'Luxury'],
    type: 'Eau De Parfum (EDP)',
    tags: ['Oriental', 'Warm', 'Rich'],
    rating: 4.9,
    reviewCount: 72,
    stock: { quantity: 20, lowStockThreshold: 5 },
    color: '#8B7355',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products successfully.`);

    created.forEach((p) => console.log(`  - ${p.name} (${p.slug})`));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
