import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '@/components/features/ProductCard';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const TAG_FILTERS = ['All', 'Fresh', 'Woody', 'Sweet', 'Floral', 'Aquatic', 'Oriental', 'Spicy', 'Warm'];

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (selectedTag !== 'All') {
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Price filter
    result = result.filter(
      (p) => p.pricing.sellingPrice >= priceRange[0] && p.pricing.sellingPrice <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.pricing.sellingPrice - b.pricing.sellingPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.pricing.sellingPrice - a.pricing.sellingPrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy, selectedTag, priceRange, products]);

  return (
    <>
      <Helmet>
        <title>Shop | Avenues Perfume</title>
        <meta name="description" content="Browse our curated collection of luxury perfumes at Avenues Perfume. Find your signature scent." />
        <link rel="canonical" href="https://avenues.in/shop" />
        <meta property="og:title" content="Shop | Avenues Perfume" />
        <meta property="og:description" content="Browse our curated collection of luxury perfumes. Find your signature scent." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avenues.in/shop" />
        <meta property="og:image" content="https://avenues.in/og-shop.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop | Avenues Perfume" />
        <meta name="twitter:description" content="Browse our curated collection of luxury perfumes. Find your signature scent." />
      </Helmet>
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Pick Your Scent
          </h1>
          <p className="text-white/60 mt-2">
            Five fragrances. One's yours. Find it.
          </p>
        </motion.div>

        {/* Search & Sort Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scents..."
              className="input-luxury pl-10 bg-[#111111] border-white/10 text-white placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-luxury pr-10 appearance-none cursor-pointer min-w-[180px] bg-[#111111] border-white/10 text-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-ghost flex items-center gap-2 border border-white/10 text-white hover:bg-white/5',
              showFilters && 'bg-white/10'
            )}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </motion.div>

        {/* Tag Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
                selectedTag === tag
                  ? 'bg-accent text-primary-900 shadow-md font-bold'
                  : 'bg-[#111111] text-white/80 hover:bg-white/10 border border-white/10'
              )}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Active Filters */}
        {(selectedTag !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-white/60">Active filters:</span>
            {selectedTag !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium border border-accent/30">
                {selectedTag}
                <button onClick={() => setSelectedTag('All')} className="hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium border border-accent/30">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-white/60 mb-6">
          Showing {filteredProducts.length} of {products.length} fragrances
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((n) => (
              <div key={n} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 sm:h-56 bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              Nothing matches that
            </h3>
            <p className="text-white/60 mb-6">
              Try a different filter or search term
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
              className="btn-secondary border-white/20 text-white hover:bg-white hover:text-primary-900 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
