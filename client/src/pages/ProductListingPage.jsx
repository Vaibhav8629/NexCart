import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Animation Variants
───────────────────────────────────────────── */
const sidebarVariants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.93, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.93,
    y: -8,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────
   Inline Styles (Black + Gold Theme)
───────────────────────────────────────────── */
const styles = {
  // Layout
  pageWrapper: {
    background: 'transparent',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },

  // Sidebar
  sidebarWrapper: {
    width: '268px',
    flexShrink: 0,
    position: 'sticky',
    top: '6rem',
    maxHeight: 'calc(100vh - 7rem)',
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
  sidebarPanel: {
    background: 'rgba(10, 9, 8, 0.72)',
    border: '1px solid rgba(212, 175, 55, 0.18)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.08)',
  },
  sidebarHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(212, 175, 55, 0.85)',
    marginBottom: '1rem',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(212,175,55,0.25) 0%, transparent 100%)',
    margin: '1.25rem 0',
  },

  // Category pills
  categoryPill: (active) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 14px',
    borderRadius: '50px',
    fontSize: '13.5px',
    fontWeight: active ? 600 : 400,
    border: active ? '1px solid rgba(212,175,55,0.55)' : '1px solid transparent',
    background: active
      ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(184,142,28,0.1) 100%)'
      : 'transparent',
    color: active ? 'rgb(212, 175, 55)' : 'rgba(255,255,255,0.52)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
    boxShadow: active ? '0 0 12px rgba(212,175,55,0.12)' : 'none',
    outline: 'none',
    letterSpacing: active ? '0.01em' : '0',
  }),

  // Price range checkbox row
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 4px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
    marginBottom: '2px',
  },
  priceRowLabel: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'color 0.18s ease',
  },
  customCheckbox: (checked) => ({
    width: '17px',
    height: '17px',
    borderRadius: '5px',
    border: checked ? '1px solid rgba(212,175,55,0.8)' : '1px solid rgba(255,255,255,0.2)',
    background: checked
      ? 'linear-gradient(135deg, rgba(212,175,55,0.85), rgba(184,142,28,0.65))'
      : 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
    boxShadow: checked ? '0 0 8px rgba(212,175,55,0.25)' : 'none',
    cursor: 'pointer',
  }),

  // Main content
  mainContent: {
    flex: 1,
    minWidth: 0,
  },

  // Header bar
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    background: 'linear-gradient(135deg, #ffffff 0%, rgba(212,175,55,0.9) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '6px',
  },
  resultsCount: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: '0.02em',
    fontWeight: 400,
  },
  resultsCountNumber: {
    color: 'rgba(212,175,55,0.75)',
    fontWeight: 600,
  },

  // Sort dropdown
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    background: 'rgba(10,9,8,0.65)',
    border: '1px solid rgba(212,175,55,0.22)',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13.5px',
    fontWeight: 500,
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  sortDropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: '220px',
    background: 'rgba(12, 11, 9, 0.92)',
    border: '1px solid rgba(212,175,55,0.25)',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    overflow: 'hidden',
    zIndex: 50,
  },
  sortItem: (active) => ({
    width: '100%',
    textAlign: 'left',
    padding: '11px 16px',
    fontSize: '13.5px',
    fontWeight: active ? 600 : 400,
    color: active ? 'rgb(212,175,55)' : 'rgba(255,255,255,0.65)',
    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.15s ease',
    outline: 'none',
  }),

  // Product grid
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: 'rgba(10,9,8,0.5)',
    border: '1px dashed rgba(212,175,55,0.2)',
    borderRadius: '20px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  emptyIconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '1.75rem',
    lineHeight: 1.6,
  },
  clearButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    borderRadius: '50px',
    background: 'rgba(212,175,55,0.12)',
    border: '1px solid rgba(212,175,55,0.4)',
    color: 'rgb(212,175,55)',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    letterSpacing: '0.02em',
  },

  // Loading
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid rgba(212,175,55,0.15)',
    borderTopColor: 'rgba(212,175,55,0.85)',
    animation: 'spin 0.75s linear infinite',
  },
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ProductListingPage() {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery || 'All');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [hoveredPrice, setHoveredPrice] = useState(null);
  const [hoveredSort, setHoveredSort] = useState(null);
  const sortRef = useRef(null);

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Accessories'];

  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'newest', label: 'Newest Arrivals' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
  ];

  const priceRanges = [
    { id: 'under50', label: 'Under ₹50' },
    { id: '50to100', label: '₹50 – ₹100' },
    { id: '100to500', label: '₹100 – ₹500' },
    { id: 'over500', label: 'Over ₹500' },
  ];

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // All original filter/sort logic — untouched
  useEffect(() => {
    if (products) {
      let result = [...products];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }

      if (selectedCategory !== 'All') {
        result = result.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      if (selectedPriceRanges.length > 0) {
        result = result.filter((p) => {
          const price = p.discountPrice || p.price;
          return selectedPriceRanges.some((range) => {
            if (range === 'under50') return price < 50;
            if (range === '50to100') return price >= 50 && price <= 100;
            if (range === '100to500') return price > 100 && price <= 500;
            if (range === 'over500') return price > 500;
            return false;
          });
        });
      }

      switch (sortBy) {
        case 'price-low':
          result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price-high':
          result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }

      setFilteredProducts(result);
    }
  }, [products, selectedCategory, sortBy, searchQuery, selectedPriceRanges]);

  const handlePriceRangeToggle = (range) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const activeSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || 'Popular';

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .price-row:hover { background: rgba(212,175,55,0.06) !important; }
        .price-row:hover .price-label { color: rgba(255,255,255,0.85) !important; }
        .sort-btn:hover { border-color: rgba(212,175,55,0.45) !important; color: rgba(255,255,255,0.95) !important; box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.12) !important; }
        .sort-item:hover { background: rgba(212,175,55,0.08) !important; color: rgba(255,255,255,0.9) !important; }
        .cat-pill:hover { color: rgba(255,255,255,0.82) !important; background: rgba(255,255,255,0.05) !important; }
        .clear-btn:hover { background: rgba(212,175,55,0.2) !important; box-shadow: 0 0 18px rgba(212,175,55,0.18) !important; }
        .sidebar-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.layout}>

          {/* ── Sidebar ── */}
          <motion.aside
            style={styles.sidebarWrapper}
            className="sidebar-scroll"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={styles.sidebarPanel}>

              {/* Categories */}
              <div style={styles.sidebarHeading}>
                <Filter size={13} style={{ color: 'rgba(212,175,55,0.7)' }} />
                Categories
              </div>

              <div>
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    style={styles.categoryPill(selectedCategory === cat)}
                    className="cat-pill"
                    whileTap={{ scale: 0.97 }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>

              {/* Divider */}
              <div style={styles.divider} />

              {/* Price Range */}
              <div style={styles.sidebarHeading}>
                <SlidersHorizontal size={13} style={{ color: 'rgba(212,175,55,0.7)' }} />
                Price Range
              </div>

              <div>
                {priceRanges.map(({ id, label }) => {
                  const checked = selectedPriceRanges.includes(id);
                  return (
                    <motion.div
                      key={id}
                      className="price-row"
                      style={styles.priceRow}
                      onClick={() => handlePriceRangeToggle(id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={styles.customCheckbox(checked)}>
                        <AnimatePresence>
                          {checked && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Check size={11} style={{ color: '#0a0908', strokeWidth: 3 }} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <span
                        className="price-label"
                        style={{
                          ...styles.priceRowLabel,
                          color: checked ? 'rgba(212,175,55,0.9)' : 'rgba(255,255,255,0.6)',
                          fontWeight: checked ? 500 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Active filters summary */}
              <AnimatePresence>
                {(selectedCategory !== 'All' || selectedPriceRanges.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={styles.divider} />
                    <motion.button
                      onClick={() => {
                        handleCategorySelect('All');
                        setSelectedPriceRanges([]);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'rgba(212,175,55,0.65)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 0',
                        letterSpacing: '0.03em',
                        transition: 'color 0.18s ease',
                      }}
                      whileHover={{ color: 'rgba(212,175,55,1)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <X size={12} />
                      Clear all filters
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>

          {/* ── Main Content ── */}
          <main style={styles.mainContent}>

            {/* Header Bar */}
            <motion.div
              style={styles.headerBar}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <div>
                <h1 style={styles.pageTitle}>
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : selectedCategory === 'All'
                    ? 'All Products'
                    : selectedCategory}
                </h1>
                <p style={styles.resultsCount}>
                  <span style={styles.resultsCountNumber}>{filteredProducts.length}</span>
                  {' '}item{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Sort Dropdown */}
              <div style={{ position: 'relative' }} ref={sortRef}>
                <button
                  className="sort-btn"
                  style={styles.sortButton}
                  onClick={() => setIsSortOpen((v) => !v)}
                >
                  <SlidersHorizontal size={15} style={{ color: 'rgba(212,175,55,0.75)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 400 }}>Sort:</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13.5px' }}>{activeSortLabel}</span>
                  <motion.span
                    animate={{ rotate: isSortOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', marginLeft: '2px' }}
                  >
                    <ChevronDown size={15} style={{ color: 'rgba(212,175,55,0.6)' }} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      style={styles.sortDropdown}
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Gold top accent line */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.5) 0%, transparent 80%)' }} />
                      <div style={{ padding: '6px 0' }}>
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            className="sort-item"
                            style={styles.sortItem(sortBy === option.id)}
                            onClick={() => { setSortBy(option.id); setIsSortOpen(false); }}
                          >
                            {option.label}
                            <AnimatePresence>
                              {sortBy === option.id && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Check size={14} style={{ color: 'rgb(212,175,55)' }} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Product Grid / Empty State */}
            <AnimatePresence mode="wait">
              {filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  style={styles.emptyState}
                  variants={emptyStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    style={styles.emptyIconWrap}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  >
                    <Search size={28} style={{ color: 'rgba(212,175,55,0.6)' }} />
                  </motion.div>
                  <h3 style={styles.emptyTitle}>No products found</h3>
                  <p style={styles.emptySubtitle}>
                    Try adjusting your filters or browse<br />a different category.
                  </p>
                  <button
                    className="clear-btn"
                    style={styles.clearButton}
                    onClick={() => {
                      handleCategorySelect('All');
                      setSelectedPriceRanges([]);
                    }}
                  >
                    <X size={14} />
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  style={styles.productGrid}
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={cardVariants}
                      whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}