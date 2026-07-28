export const BRAND = {
  name: 'AVENUES',
  tagline: 'Luxury That Speaks Louder',
  description: 'Premium Indian-made fragrances that get people asking "what are you wearing?"',
  currency: '₹',
  taxRate: 0.18,
  freeShippingThreshold: 500,
  standardShipping: 49,
  expressShipping: 99,
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your vibe?",
    options: [
      { label: 'Fresh & Clean', value: 'fresh', icon: '🌊' },
      { label: 'Bold & Confident', value: 'bold', icon: '🔥' },
      { label: 'Sweet & Warm', value: 'sweet', icon: '🌹' },
      { label: 'Rich & Luxurious', value: 'luxury', icon: '👑' },
    ],
  },
  {
    id: 2,
    question: 'Pick the one that speaks to your nose:',
    options: [
      { label: 'Citrus & Floral', value: 'citrus-floral', icon: '🍋' },
      { label: 'Woody & Earthy', value: 'woody', icon: '🌲' },
      { label: 'Sweet & Vanilla', value: 'sweet-vanilla', icon: '🍯' },
      { label: 'Oriental & Spicy', value: 'oriental', icon: '🌶️' },
    ],
  },
  {
    id: 3,
    question: 'When are you wearing this?',
    options: [
      { label: 'Daily office grind', value: 'office', icon: '💼' },
      { label: 'Dates & special nights', value: 'dates', icon: '💝' },
      { label: 'Parties & nights out', value: 'night', icon: '🌙' },
      { label: 'Any time, any place', value: 'allday', icon: '☀️' },
    ],
  },
  {
    id: 4,
    question: 'How loud do you want it?',
    options: [
      { label: 'Light & subtle', value: 'light', icon: '🌸' },
      { label: 'Moderate & balanced', value: 'moderate', icon: '⚖️' },
      { label: 'Strong & bold', value: 'strong', icon: '💪' },
      { label: 'Maximum presence', value: 'very-strong', icon: '⚡' },
    ],
  },
  {
    id: 5,
    question: 'Last one — describe your style:',
    options: [
      { label: 'Minimalist', value: 'minimalist', icon: '🎯' },
      { label: 'Sophisticated', value: 'sophisticated', icon: '🎩' },
      { label: 'Adventurous', value: 'adventurous', icon: '🗺️' },
      { label: 'Classic', value: 'classic', icon: '♟️' },
    ],
  },
];

export const QUIZ_RESULT_MAP = {
  'fresh+citrus-floral+office+light+minimalist': 4,
  'fresh+citrus-floral+office+moderate+minimalist': 4,
  'fresh+woody+office+moderate+minimalist': 1,
  'bold+woody+office+strong+sophisticated': 1,
  'bold+woody+allday+strong+adventurous': 1,
  'sweet+sweet-vanilla+night+strong+adventurous': 3,
  'sweet+sweet-vanilla+dates+moderate+sophisticated': 2,
  'luxury+oriental+dates+very-strong+sophisticated': 5,
  'luxury+oriental+night+very-strong+classic': 5,
};

export const QUIZ_DEFAULT_MAP = {
  fresh: 4,
  bold: 1,
  sweet: 3,
  luxury: 5,
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Arjun M.',
    rating: 5,
    text: 'Three months in, still getting "what are you wearing?" at the office. The bergamot opening is chef\'s kiss.',
    product: 'Avenues Intense',
    avatar: 'AM',
  },
  {
    id: 2,
    name: 'Rohan K.',
    rating: 5,
    text: 'Night Drip is actually ridiculous. Wore it to a house party — three people stopped me to ask. Not even joking.',
    product: 'Avenues Night Drip',
    avatar: 'RK',
  },
  {
    id: 3,
    name: 'Vikram S.',
    rating: 5,
    text: 'White Oud smells like old money. The saffron opening into that deep oud heart — worth every single rupee.',
    product: 'Avenues White Oud',
    avatar: 'VS',
  },
  {
    id: 4,
    name: 'Karan P.',
    rating: 4,
    text: 'Blue Mist is my daily driver. Fresh, clean, doesn\'t try too hard. Lasts through my entire shift and then some.',
    product: 'Avenues Blue Mist',
    avatar: 'KP',
  },
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
];

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  processing: { label: 'Processing', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay when it arrives' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳', description: 'Coming soon', disabled: true },
  { id: 'upi', label: 'UPI', icon: '📱', description: 'Coming soon', disabled: true },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
