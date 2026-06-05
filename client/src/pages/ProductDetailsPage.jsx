import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ReviewList from '../components/reviews/ReviewList';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

/* ─── Animation Variants ─── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.12 } },
};
const panelVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const galleryVariants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const cardEntrance = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Inline Style Tokens (Black + Gold) ─── */
const S = {
  page: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gap: '3.5rem',
    marginBottom: '5rem',
    alignItems: 'start',
  },

  /* Gallery */
  galleryWrap: {
    position: 'sticky',
    top: '5.5rem',
  },
  mainImgWrap: {
    position: 'relative',
    aspectRatio: '1/1',
    borderRadius: '20px',
    overflow: 'hidden',
    background: 'rgba(18,16,12,0.7)',
    border: '1px solid rgba(212,175,55,0.18)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.1)',
    cursor: 'zoom-in',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.45s ease',
  },
  saleBadge: {
    position: 'absolute',
    top: '18px',
    left: '18px',
    background: 'linear-gradient(135deg, rgba(212,175,55,0.95), rgba(184,142,28,0.85))',
    color: '#0a0908',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '5px 12px',
    borderRadius: '50px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
  },
  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginTop: '14px',
  },
  thumb: (active) => ({
    aspectRatio: '1/1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: active ? '2px solid rgba(212,175,55,0.85)' : '2px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: active ? '0 0 16px rgba(212,175,55,0.3)' : 'none',
    background: 'rgba(18,16,12,0.5)',
  }),
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease, opacity 0.2s ease',
  },

  /* Info panel */
  infoPanel: {
    background: 'rgba(10,9,8,0.6)',
    border: '1px solid rgba(212,175,55,0.14)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.07)',
  },
  categoryLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(212,175,55,0.8)',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  productTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    lineHeight: 1.1,
    color: '#ffffff',
    marginBottom: '1.1rem',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '1.4rem',
  },
  stockPill: (outOfStock) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '50px',
    background: outOfStock ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.1)',
    border: outOfStock ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(74,222,128,0.3)',
    color: outOfStock ? 'rgb(239,68,68)' : 'rgb(74,222,128)',
  }),
  priceDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(212,175,55,0.3) 0%, transparent 70%)',
    margin: '1.4rem 0',
  },
  priceMain: {
    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #ffffff 0%, rgba(212,175,55,0.9) 60%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  priceStrike: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.3)',
    textDecoration: 'line-through',
    marginLeft: '10px',
    fontWeight: 400,
    WebkitTextFillColor: 'rgba(255,255,255,0.3)',
  },
  saveBadge: {
    fontSize: '12px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '50px',
    background: 'rgba(212,175,55,0.15)',
    border: '1px solid rgba(212,175,55,0.35)',
    color: 'rgb(212,175,55)',
    marginLeft: '10px',
  },
  desc: {
    fontSize: '14.5px',
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 1.75,
    marginBottom: '1.75rem',
  },

  /* Quantity */
  qtyWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '50px',
    height: '52px',
    overflow: 'hidden',
    width: 'fit-content',
  },
  qtyBtn: {
    padding: '0 18px',
    height: '100%',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'color 0.18s ease',
    outline: 'none',
  },
  qtyNum: {
    minWidth: '36px',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
  },

  /* CTA Buttons */
  addCartBtn: {
    flex: 1,
    height: '52px',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(184,142,28,0.9) 100%)',
    border: 'none',
    color: '#0a0908',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 8px 32px rgba(212,175,55,0.25)',
    transition: 'all 0.22s ease',
    outline: 'none',
  },
  buyNowBtn: {
    flex: 1,
    height: '52px',
    borderRadius: '50px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.22s ease',
    outline: 'none',
  },
  wishBtn: (active) => ({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
    border: active ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.12)',
    color: active ? 'rgb(239,68,68)' : 'rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    outline: 'none',
    flexShrink: 0,
  }),

  /* Trust badges */
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '1.75rem',
    paddingTop: '1.75rem',
    borderTop: '1px solid rgba(212,175,55,0.12)',
  },
  trustCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  trustIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Tabs */
  tabSection: {
    marginTop: '4rem',
    borderTop: '1px solid rgba(212,175,55,0.12)',
    paddingTop: '3rem',
  },
  tabBar: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '2.5rem',
    position: 'relative',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  tabBtn: (active) => ({
    padding: '12px 28px',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: active ? 700 : 500,
    color: active ? 'rgb(212,175,55)' : 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
    position: 'relative',
  }),
  tabUnderline: {
    position: 'absolute',
    bottom: '-1px',
    height: '2px',
    background: 'linear-gradient(90deg, rgba(212,175,55,0.9), rgba(184,142,28,0.6))',
    borderRadius: '2px 2px 0 0',
    boxShadow: '0 0 10px rgba(212,175,55,0.35)',
  },
  tabContent: {
    minHeight: '200px',
  },

  /* Specs table */
  specTable: {
    width: '100%',
    borderCollapse: 'collapse',
    maxWidth: '680px',
  },
  specRow: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  specKey: {
    padding: '14px 16px 14px 0',
    fontSize: '13.5px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.65)',
    width: '35%',
    verticalAlign: 'top',
  },
  specVal: {
    padding: '14px 0',
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.45)',
  },

  /* Related products */
  relatedSection: {
    marginTop: '5rem',
  },
  relatedHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  relatedTitle: {
    fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #ffffff 0%, rgba(212,175,55,0.85) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  relatedSubtitle: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '4px',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },

  /* Loading */
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
  },
  spinner: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '3px solid rgba(212,175,55,0.12)',
    borderTopColor: 'rgba(212,175,55,0.85)',
    animation: 'spin 0.75s linear infinite',
  },
};

/* ─── Tab label positions for sliding underline ─── */
const TABS = ['description', 'specifications', 'reviews'];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchSingleProduct, products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [liveRating, setLiveRating] = useState(null);
  const [liveNumReviews, setLiveNumReviews] = useState(null);
  const [imgHovered, setImgHovered] = useState(false);
  const [tabUnderlineStyle, setTabUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});

  useEffect(() => {
    fetchSingleProduct(id);
    window.scrollTo(0, 0);
  }, [fetchSingleProduct, id]);

  useEffect(() => {
    if (currentProduct) {
      setLiveRating(currentProduct.rating);
      setLiveNumReviews(currentProduct.numReviews);
    }
  }, [currentProduct]);

  // Measure tab button for sliding underline
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setTabUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  const handleRatingUpdate = () => { fetchSingleProduct(id); };

  if (loading || !currentProduct || currentProduct._id !== id) {
    return (
      <div style={S.loadingWrap}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={S.spinner} />
      </div>
    );
  }

  const images = currentProduct.images?.length
    ? currentProduct.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'];

  const isOutOfStock = Number(currentProduct.stock) <= 0;
  const relatedProducts =
    products?.filter((p) => p.category === currentProduct.category && p._id !== currentProduct._id).slice(0, 4) || [];

  const displayRating = liveRating ?? currentProduct.rating ?? 0;
  const displayNumReviews = liveNumReviews ?? currentProduct.numReviews ?? 0;

  const discount = currentProduct.discountPrice > 0
    ? Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100)
    : 0;

  const handleAddToCart = () => { if (!user) { navigate('/login'); return; } addToCart(currentProduct, quantity); };
  const handleBuyNow   = () => { if (!user) { navigate('/login'); return; } addToCart(currentProduct, quantity); navigate('/cart'); };
  const handleWishlist = () => { if (!user) { navigate('/login'); return; } toggleWishlist(currentProduct); };

  const wishlisted = isInWishlist(currentProduct._id);

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .add-cart-btn:hover:not(:disabled) { box-shadow: 0 12px 40px rgba(212,175,55,0.45) !important; filter: brightness(1.08); }
        .buy-now-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.3) !important; color: #fff !important; }
        .wish-btn:hover { filter: brightness(1.2); }
        .qty-btn:hover:not(:disabled) { color: rgb(212,175,55) !important; }
        .thumb-img:hover { transform: scale(1.08); }
        .tab-bar::-webkit-scrollbar { display: none; }
        .spec-row:hover td { color: rgba(255,255,255,0.75) !important; }
      `}</style>

      <motion.div style={S.page} variants={pageVariants} initial="hidden" animate="visible">

        {/* ── Hero: Gallery + Info ── */}
        <div style={S.heroGrid}>

          {/* Left: Sticky Image Gallery */}
          <motion.div style={S.galleryWrap} variants={galleryVariants}>

            {/* Main image */}
            <motion.div
              style={S.mainImgWrap}
              onHoverStart={() => setImgHovered(true)}
              onHoverEnd={() => setImgHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={currentProduct.name}
                  style={{
                    ...S.mainImg,
                    transform: imgHovered ? 'scale(1.06)' : 'scale(1)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                />
              </AnimatePresence>

              {discount > 0 && (
                <motion.div
                  style={S.saleBadge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  −{discount}% OFF
                </motion.div>
              )}

              {/* Image nav arrows (multi-image) */}
              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(10,9,8,0.7)',
                      border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', outline: 'none', backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{ scale: 1.1, borderColor: 'rgba(212,175,55,0.7)' }}
                    whileTap={{ scale: 0.93 }}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(10,9,8,0.7)',
                      border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', outline: 'none', backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{ scale: 1.1, borderColor: 'rgba(212,175,55,0.7)' }}
                    whileTap={{ scale: 0.93 }}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '6px',
                }}>
                  {images.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        width: i === activeImage ? '20px' : '6px',
                        height: '6px', borderRadius: '3px', outline: 'none', border: 'none',
                        background: i === activeImage ? 'rgba(212,175,55,0.9)' : 'rgba(255,255,255,0.25)',
                        cursor: 'pointer', transition: 'all 0.25s ease',
                      }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={S.thumbGrid}>
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    style={S.thumb(activeImage === idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="thumb-img"
                      style={{
                        ...S.thumbImg,
                        opacity: activeImage === idx ? 1 : 0.55,
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info Panel */}
          <motion.div variants={panelVariants}>
            <div style={S.infoPanel}>

              {/* Category */}
              <div style={S.categoryLabel}>
                <Sparkles size={11} style={{ color: 'rgba(212,175,55,0.7)' }} />
                {currentProduct.category}
              </div>

              {/* Title */}
              <h1 style={S.productTitle}>{currentProduct.name}</h1>

              {/* Rating + Stock */}
              <div style={S.ratingRow}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      style={{
                        color: star <= Math.round(displayRating) ? 'rgb(251,191,36)' : 'rgba(255,255,255,0.15)',
                        fill:  star <= Math.round(displayRating) ? 'rgb(251,191,36)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('reviews')}
                  style={{
                    fontSize: '12.5px', color: 'rgba(255,255,255,0.38)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'color 0.18s ease', outline: 'none',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'rgba(212,175,55,0.8)'}
                  onMouseOut={(e)  => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                >
                  {displayRating > 0
                    ? `${Number(displayRating).toFixed(1)} · ${displayNumReviews} review${displayNumReviews !== 1 ? 's' : ''}`
                    : `${displayNumReviews} review${displayNumReviews !== 1 ? 's' : ''}`}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
                <span style={S.stockPill(isOutOfStock)}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>

              {/* Price */}
              <div style={S.priceDivider} />
              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px', marginBottom: '1.4rem' }}>
                <span style={S.priceMain}>
                  {formatCurrency(currentProduct.discountPrice || currentProduct.price)}
                </span>
                {currentProduct.discountPrice > 0 && (
                  <>
                    <span style={S.priceStrike}>{formatCurrency(currentProduct.price)}</span>
                    <span style={S.saveBadge}>Save {discount}%</span>
                  </>
                )}
              </div>
              <div style={S.priceDivider} />

              {/* Description */}
              <p style={S.desc}>{currentProduct.description}</p>

              {/* Quantity + Add to Cart */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={S.qtyWrap}>
                  <motion.button
                    className="qty-btn"
                    style={S.qtyBtn}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    whileTap={{ scale: 0.88 }}
                  >−</motion.button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={quantity}
                      style={S.qtyNum}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                    >{quantity}</motion.span>
                  </AnimatePresence>
                  <motion.button
                    className="qty-btn"
                    style={S.qtyBtn}
                    onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= currentProduct.stock}
                    whileTap={{ scale: 0.88 }}
                  >+</motion.button>
                </div>

                <motion.button
                  className="add-cart-btn"
                  style={{ ...S.addCartBtn, opacity: isOutOfStock ? 0.4 : 1 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  whileHover={!isOutOfStock ? { scale: 1.025, y: -1 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.97 } : {}}
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </motion.button>
              </div>

              {/* Buy Now + Wishlist */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  className="buy-now-btn"
                  style={{ ...S.buyNowBtn, opacity: isOutOfStock ? 0.4 : 1 }}
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  whileHover={!isOutOfStock ? { scale: 1.025, y: -1 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.97 } : {}}
                >
                  Buy Now
                </motion.button>

                <motion.button
                  className="wish-btn"
                  style={S.wishBtn(wishlisted)}
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={wishlisted ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <Heart
                    size={19}
                    style={{ fill: wishlisted ? 'currentColor' : 'none', transition: 'fill 0.22s ease' }}
                  />
                </motion.button>
              </div>

              {/* Trust badges */}
              <div style={S.trustGrid}>
                <div style={S.trustCard}>
                  <div style={S.trustIconWrap}>
                    <Truck size={17} style={{ color: 'rgba(212,175,55,0.8)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Free Delivery</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Orders above ₹499</p>
                  </div>
                </div>
                <div style={S.trustCard}>
                  <div style={S.trustIconWrap}>
                    <ShieldCheck size={17} style={{ color: 'rgba(212,175,55,0.8)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Easy Returns</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Free 30 day returns</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Tabs ── */}
        <motion.div
          style={S.tabSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tab bar with sliding underline */}
          <div className="tab-bar" style={S.tabBar}>
            {TABS.map((tab) => (
              <button
                key={tab}
                ref={(el) => (tabRefs.current[tab] = el)}
                onClick={() => setActiveTab(tab)}
                style={S.tabBtn(activeTab === tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && displayNumReviews > 0 && (
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: 'rgba(212,175,55,0.6)', fontWeight: 500 }}>
                    ({displayNumReviews})
                  </span>
                )}
              </button>
            ))}
            {/* Sliding gold underline */}
            <motion.div
              style={{ ...S.tabUnderline, ...tabUnderlineStyle }}
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            />
          </div>

          {/* Tab content */}
          <div style={S.tabContent}>
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="desc"
                  variants={tabContentVariants}
                  initial="hidden" animate="visible" exit="exit"
                  style={{ maxWidth: '720px' }}
                >
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '1.2rem' }}>
                    {currentProduct.description}
                  </p>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.8 }}>
                    Experience the perfect blend of style and performance with the{' '}
                    <span style={{ color: 'rgba(212,175,55,0.75)' }}>{currentProduct.name}</span>.
                    Designed for the modern consumer, this premium product delivers exceptional quality
                    that you can feel in every detail.
                  </p>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specs"
                  variants={tabContentVariants}
                  initial="hidden" animate="visible" exit="exit"
                >
                  <table style={S.specTable}>
                    <tbody>
                      {[
                        ['Brand',    currentProduct.brand || 'NexCart Exclusive'],
                        ['Category', currentProduct.category],
                        ['Stock',    `${currentProduct.stock} units available`],
                      ].map(([key, val]) => (
                        <tr key={key} className="spec-row" style={S.specRow}>
                          <td style={S.specKey}>{key}</td>
                          <td style={S.specVal}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  variants={tabContentVariants}
                  initial="hidden" animate="visible" exit="exit"
                >
                  <ReviewList
                    productId={currentProduct._id}
                    rating={displayRating}
                    numReviews={displayNumReviews}
                    onRatingUpdate={handleRatingUpdate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <motion.div
            style={S.relatedSection}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={S.relatedHeader}>
              <div>
                <h2 style={S.relatedTitle}>You May Also Like</h2>
                <p style={S.relatedSubtitle}>Curated picks from {currentProduct.category}</p>
              </div>
            </div>

            <motion.div
              style={S.relatedGrid}
              variants={staggerGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {relatedProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardEntrance}
                  whileHover={{ y: -5, transition: { duration: 0.22, ease: 'easeOut' } }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}