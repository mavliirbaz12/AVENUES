import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { formatCurrency, cn } from '@/lib/utils';
import { fadeVariants, slideDownVariants } from '@/lib/animations';
import useUIStore from '@/store/uiStore';
import { getButtonAria, getFieldAria } from '@/lib/accessibility';

/**
 * SearchBar Component
 * Handles search functionality with suggestions dropdown
 */
export function SearchBar({ isOpen, onClose }) {
  const { searchQuery, setSearchQuery } = useUIStore();
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigate = useNavigate();
  const listboxRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch { /* ignore */ }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const matched = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      ).slice(0, 4);
      setSuggestions(matched);
      setFocusedIndex(-1);
    } else {
      setSuggestions([]);
      setFocusedIndex(-1);
    }
  }, [searchQuery, products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleSuggestionClick = () => {
    onClose();
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          const selected = suggestions[focusedIndex];
          navigate(`/product/${selected.slug}`);
          handleSuggestionClick();
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={slideDownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-[#050505] border-t border-white/5"
        >
          <div className="container-luxury py-4 relative">
            <form onSubmit={handleSearch} role="search">
              <div className="relative max-w-2xl mx-auto">
                <input
                  {...getFieldAria({
                    id: 'search-input',
                    label: 'Search products',
                    describedBy: 'search-hint',
                  })}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find your scent..."
                  className="w-full bg-[#111111] border border-white/10 text-white placeholder:text-white/40 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  aria-hidden="true"
                />
                <span id="search-hint" className="sr-only">
                  Start typing to find your scent
                </span>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  ref={listboxRef}
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="max-w-2xl mx-auto mt-2 bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden absolute left-0 right-0 z-50 px-4 py-2"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  <p className="text-xs text-white/40 font-medium px-4 pt-2 pb-1 uppercase tracking-wider">
                    Suggestions
                  </p>
                  {suggestions.map((p, index) => (
                    <Link
                      key={p._id || p.id}
                      to={`/product/${p.slug}`}
                      onClick={handleSuggestionClick}
                      className={cn(
                        'flex items-center gap-4 p-3 hover:bg-white/5 transition-colors rounded-lg group focus:outline-none focus:ring-2 focus:ring-accent/50',
                        focusedIndex === index && 'bg-white/5'
                      )}
                      role="option"
                      aria-posinset={index + 1}
                      aria-setsize={suggestions.length}
                      tabIndex={focusedIndex === index ? 0 : -1}
                    >
                      <div
                        className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors"
                        style={{ background: `linear-gradient(135deg, ${p.color}20, ${p.color}40)` }}
                        aria-hidden="true"
                      >
                        <span className="text-xl">🧴</span>
                      </div>
                      <div>
                        <p className="font-display font-medium text-white group-hover:text-accent transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {p.type} • {formatCurrency(p.pricing.sellingPrice)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 pb-2 pt-2 text-center border-t border-white/5 mt-2">
                    <button
                      onClick={handleSearch}
                      className="text-xs text-accent hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 rounded px-2 py-1"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
