import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { Check } from 'lucide-react';

const promises = [
  'Finest ingredients sourced from around the globe',
  '8-12+ hours of scent that actually lasts',
  'Cruelty-free and responsibly made',
  '100% authentic, blended and bottled in India',
  'Premium quality without the designer price tag',
];

/**
 * AboutPage Component
 * Company information and mission
 */
export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | Avenues Perfume</title>
        <meta name="description" content="Learn about Avenues Perfume, a luxury fragrance brand built on bold identity and quality craftsmanship." />
        <link rel="canonical" href="https://avenues.in/about" />
        <meta property="og:title" content="About Us | Avenues Perfume" />
        <meta property="og:description" content="Learn about Avenues Perfume, a luxury fragrance brand built on bold identity and quality craftsmanship." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avenues.in/about" />
        <meta property="og:image" content="https://avenues.in/og-about.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-xs tracking-[0.25em] uppercase font-bold mb-4 block">
            About Us
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            About Avenues
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Born from a belief that great fragrance shouldn't cost a fortune. We make premium Indian-made EDPs 
            that get people stopping you on the street. That's not a promise — it's a pattern.
          </p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Mission Section */}
          <motion.div
            variants={staggerItemVariants}
            className="card-luxury p-8 sm:p-10"
          >
            <h2 className="font-display text-2xl font-bold mb-4 text-accent">
              Our Mission
            </h2>
            <p className="text-white/70 leading-relaxed text-lg">
              Make premium fragrances accessible to every guy who values confidence, style, and presence. 
              Every Avenues bottle is crafted to deliver long-lasting, unforgettable scent experiences — 
              without the designer markup.
            </p>
          </motion.div>

          {/* Promise Section */}
          <motion.div
            variants={staggerItemVariants}
            className="card-luxury p-8 sm:p-10"
          >
            <h2 className="font-display text-2xl font-bold mb-6 text-accent">
              Our Promise
            </h2>
            <ul className="space-y-4">
              {promises.map((promise, index) => (
                <motion.li
                  key={index}
                  variants={staggerItemVariants}
                  className="flex items-start gap-3 text-white/70"
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-accent" />
                  </div>
                  <span>{promise}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Values Section */}
          <motion.div
            variants={staggerItemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'Quality',
                description: 'No cutting corners. Every ingredient is selected for maximum impact and lasting power.',
              },
              {
                title: 'Innovation',
                description: 'Constantly exploring new scent profiles and pushing what Indian-made fragrance can be.',
              },
              {
                title: 'Sustainability',
                description: 'Eco-friendly practices, responsible sourcing, and packaging that respects the planet.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="card-luxury p-6 text-center hover:border-accent/30"
              >
                <h3 className="font-display text-xl font-bold mb-2 text-white">
                  {value.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
