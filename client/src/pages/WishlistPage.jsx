import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, TrendingUp, Tag, CheckCircle, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

// ── Animated Counter ────────────────────────────────────────────────────────────
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1400 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ── Floating Particles ──────────────────────────────────────────────────────────
function FloatingParticles({ count = 20 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: `radial-gradient(circle, rgba(212,175,55,0.9), rgba(212,175,55,0.1))`,
            boxShadow: `0 0 ${p.size * 4}px rgba(212,175,55,0.5)`,
          }}
          animate={{ y: [0, -28, 0], x: [0, Math.random() * 16 - 8, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Floating Hearts ─────────────────────────────────────────────────────────────
function FloatingHearts() {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + i * 11,
    y: Math.random() * 70 + 10,
    size: Math.random() * 16 + 10,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
    opacity: Math.random() * 0.12 + 0.04,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, opacity: h.opacity }}
          animate={{ y: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart size={h.size} style={{ color: '#D4AF37', fill: 'rgba(212,175,55,0.4)' }} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Confirm Clear Modal ─────────────────────────────────────────────────────────
function ClearModal({ onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #0f0f0f, #0a0a0a)',
            border: '1px solid rgba(212,175,55,0.35)',
            borderRadius: 24,
            padding: '40px 36px',
            maxWidth: 400, width: '90%',
            boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 30px 80px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 20px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={24} style={{ color: '#ef4444' }} />
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 10 }}>
            Clear Wishlist?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
            This action will remove all saved products from your wishlist. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
              }}
            >Cancel</motion.button>
            <motion.button
              onClick={onConfirm}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: 'linear-gradient(135deg, #ef4444, #c53030)', border: 'none', color: 'white',
                boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
              }}
            >Clear All</motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, prefix = '', suffix = '', delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      whileHover={{ y: -6, boxShadow: '0 0 40px rgba(212,175,55,0.22)' }}
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(0,0,0,0.5))',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 20, padding: '24px 20px',
        cursor: 'default', transition: 'box-shadow 0.3s ease',
      }}
    >
      <motion.div
        whileHover={{ rotate: 10 }}
        style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 14,
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={20} style={{ color: '#D4AF37' }} />
      </motion.div>
      <p style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1, marginBottom: 6 }}>
        <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
    </motion.div>
  );
}

// ── Sort Dropdown ───────────────────────────────────────────────────────────────
function SortDropdown({ value, onChange }) {
  const options = [
    { value: 'default', label: 'Recently Added' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <SlidersHorizontal size={14} style={{ color: '#D4AF37', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '10px 14px 10px 34px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)',
          color: 'rgba(255,255,255,0.8)', cursor: 'pointer', appearance: 'none', outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: 'white' }}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Main Wishlist Page ──────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { wishlistItems, clearWishlist } = useWishlist();
  const [showClearModal, setShowClearModal] = useState(false);
  const [sort, setSort] = useState('default');

  const totalValue = wishlistItems.reduce((sum, p) => sum + (p.price || 0), 0);
  const uniqueCategories = new Set(wishlistItems.map(p => p.category).filter(Boolean)).size;
  const inStock = wishlistItems.filter(p => p.stock > 0 || p.countInStock > 0 || p.inStock).length;

  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sort === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (wishlistItems.length === 0) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <FloatingParticles count={16} />

          {/* Glow blobs */}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', top: '10%', left: '20%', pointerEvents: 'none' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            style={{ textAlign: 'center', padding: '40px 24px', position: 'relative', zIndex: 1, maxWidth: 480 }}
          >
            {/* Heart Illustration */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}
            >
              <motion.div
                animate={{ boxShadow: ['0 0 30px rgba(212,175,55,0.2)', '0 0 70px rgba(212,175,55,0.45)', '0 0 30px rgba(212,175,55,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.04))',
                  border: '1px solid rgba(212,175,55,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Heart size={52} style={{ color: '#D4AF37', fill: 'rgba(212,175,55,0.25)' }} />
              </motion.div>
              {/* Orbiting hearts */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{ position: 'absolute', top: '50%', left: '50%' }}
                  animate={{ rotate: [i * 120, i * 120 + 360] }}
                  transition={{ duration: 8 + i, repeat: Infinity, ease: 'linear' }}
                >
                  <motion.div style={{ transform: 'translate(64px, -8px)', opacity: 0.35 + i * 0.1 }}>
                    <Heart size={12 + i * 4} style={{ color: '#D4AF37', fill: 'rgba(212,175,55,0.5)' }} />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 12 }}
            >
              Your Wishlist Awaits
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}
            >
              Save products you love and build your personal collection.
            </motion.p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Explore Products', to: '/products', primary: true, delay: 0.3 },
                { label: 'Trending Products', to: '/products?sort=trending', primary: false, delay: 0.38 },
              ].map(btn => (
                <motion.div
                  key={btn.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: btn.delay }}
                >
                  <Link to={btn.to}>
                    <motion.span
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '13px 28px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        ...(btn.primary ? {
                          background: 'linear-gradient(135deg, #D4AF37, #C9A227)',
                          color: '#000', boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
                        } : {
                          background: 'transparent', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37',
                        }),
                      }}
                    >
                      {btn.primary ? <Sparkles size={15} /> : <TrendingUp size={15} />} {btn.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Filled Wishlist ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      {showClearModal && (
        <ClearModal
          onConfirm={() => { clearWishlist(); setShowClearModal(false); }}
          onCancel={() => setShowClearModal(false)}
        />
      )}

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>

        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <div style={{
          minHeight: 300, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0d07 50%, #0a0a0a 100%)',
          borderBottom: '1px solid rgba(212,175,55,0.14)',
        }}>
          {/* Glow blobs */}
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.065) 0%, transparent 65%)', top: -200, left: -100, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)', bottom: -100, right: 0, pointerEvents: 'none' }} />

          <FloatingParticles count={22} />
          <FloatingHearts />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', damping: 18 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#D4AF37', fontSize: 11, fontWeight: 700, padding: '4px 12px',
                    borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Personal Collection</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
                  My Wishlist
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7, maxWidth: 420, marginBottom: 28 }}>
                  Your personal collection of products you love and plan to purchase.
                </p>
                {/* Quick stats */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Saved Items', value: wishlistItems.length },
                    { label: 'Est. Value', value: `₹${totalValue.toLocaleString('en-IN')}` },
                    { label: 'Categories', value: uniqueCategories || '—' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#D4AF37', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — Decorative illustration */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative' }}
            >
              <motion.div
                animate={{ boxShadow: ['0 0 40px rgba(212,175,55,0.2)', '0 0 80px rgba(212,175,55,0.45)', '0 0 40px rgba(212,175,55,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.03))',
                  border: '1px solid rgba(212,175,55,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Heart size={60} style={{ color: '#D4AF37', fill: 'rgba(212,175,55,0.3)' }} />
              </motion.div>
              {/* Orbiting cards */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  style={{ position: 'absolute', top: '50%', left: '50%' }}
                  animate={{ rotate: [i * 90, i * 90 + 360] }}
                  transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'linear' }}
                >
                  <motion.div style={{ transform: `translate(80px, -12px)` }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ShoppingBag size={12} style={{ color: '#D4AF37' }} />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>

          {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
            <StatCard icon={Heart} value={wishlistItems.length} label="Total Saved Products" delay={0.05} />
            <StatCard icon={TrendingUp} value={totalValue} prefix="₹" label="Estimated Value" delay={0.1} />
            <StatCard icon={Tag} value={uniqueCategories} label="Categories Saved" delay={0.15} />
            <StatCard icon={CheckCircle} value={inStock} label="Ready to Purchase" delay={0.2} />
          </div>

          {/* ── Collection Header ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16, marginBottom: 32,
              paddingBottom: 24, borderBottom: '1px solid rgba(212,175,55,0.15)',
            }}
          >
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                Your Collection
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
                {wishlistItems.length} saved product{wishlistItems.length !== 1 ? 's' : ''} curated for you
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <SortDropdown value={sort} onChange={setSort} />

              <Link to="/products">
                <motion.span
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#000',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
                  }}
                >
                  <ShoppingBag size={14} /> Continue Shopping
                </motion.span>
              </Link>

              <motion.button
                onClick={() => setShowClearModal(true)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                }}
              >
                <Trash2 size={14} /> Clear Wishlist
              </motion.button>
            </div>
          </motion.div>

          {/* ── Product Grid ───────────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {sortedItems.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                transition={{ delay: index * 0.06, type: 'spring', damping: 18 }}
                whileHover={{ y: -6 }}
                style={{
                  transition: 'box-shadow 0.3s ease',
                  borderRadius: 20,
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 36px rgba(212,175,55,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}