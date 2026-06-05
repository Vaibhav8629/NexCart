import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Crown, Sparkles, ShieldCheck, Truck, Zap,
  Star, RotateCcw, Users, Package, ChevronRight, Play,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import TextType from '../components2/TextType';
import CardSwap, { Card } from '../components2/CardSwap';
import BorderGlow from '../components2/BorderGlow';


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F0C040';
const GOLD_DARK = '#9A7B1C';

const categories = [
  { name: 'Electronics', count: 240, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Fashion', count: 380, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Accessories', count: 170, image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Home', count: 210, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Sports', count: 190, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200' },
];

const features = [
  { icon: Truck, title: 'Free Worldwide Shipping', desc: 'Fast and reliable delivery to your doorstep.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Protected transactions powered by trusted gateways.' },
  { icon: Crown, title: 'Curated Premium Products', desc: 'Handpicked collections from trusted brands.' },
  { icon: Zap, title: 'Lightning Fast Delivery', desc: 'Quick fulfillment and real-time order tracking.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Simple return process with customer-first support.' },
  { icon: Users, title: 'Trusted By Thousands', desc: 'Loved by shoppers across multiple categories.' },
];

const heroImages = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=85&w=1000",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=85&w=1000",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=85&w=1000",
  "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8VFZ8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=85&w=1000",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=85&w=1000",
  "https://plus.unsplash.com/premium_photo-1682435566673-cedb75cd7459?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BvcnRzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXR5JTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbGV0fGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1630851278830-c0c9b12933ee?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNyaWNrZXQlMjBiYXR8ZW58MHx8MHx8fDA%3D"
];

const brands = ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'Puma', 'Logitech', 'JBL'];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE ANIMATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function FloatingParticles({ count = 20 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8, dur: Math.random() * 8 + 6, delay: Math.random() * 5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: `radial-gradient(circle, rgba(212,175,55,0.9), rgba(212,175,55,0.1))`,
            boxShadow: `0 0 ${p.size * 4}px rgba(212,175,55,0.5)`,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
      borderRadius: 999, padding: '5px 16px', marginBottom: 16,
    }}>
      <Sparkles size={12} style={{ color: GOLD }} />
      <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{children}</span>
    </div>
  );
}

function SectionHeading({ label, title, subtitle, center = true }) {
  return (
    <FadeUp style={{ textAlign: center ? 'center' : 'left', marginBottom: 56 }}>
      <SectionLabel>{label}</SectionLabel>
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 14,
      }}>{title}</h2>
      {subtitle && <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16, maxWidth: 520, margin: center ? '0 auto' : undefined, lineHeight: 1.7 }}>{subtitle}</p>}
    </FadeUp>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#080808', color: 'white', overflowX: 'hidden' },
  section: { maxWidth: 1280, margin: '0 auto', padding: '100px 32px' },
  divider: { borderTop: '1px solid rgba(212,175,55,0.1)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO FLOATING CARDS
// ─────────────────────────────────────────────────────────────────────────────
function HeroFloatingCard({ style, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', damping: 16 }}
      style={{
        position: 'absolute', backdropFilter: 'blur(20px)',
        background: 'rgba(10,10,10,0.75)', border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 18, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 10, ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { products, fetchProducts, loading } = useProducts();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -60]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const featuredProducts =
    products?.filter(p => p.featured)?.slice(0, 8) ||
    products?.slice(0, 8) || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .nc-page * { font-family: 'DM Sans', sans-serif; }
        .nc-display { font-family: 'Playfair Display', Georgia, serif !important; }
        .nc-gold-btn {
          background: linear-gradient(135deg, #D4AF37, #C9A227);
          color: #000; border: none; padding: 14px 32px; border-radius: 14px;
          font-weight: 700; font-size: 15px; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.2s ease;
          box-shadow: 0 4px 24px rgba(212,175,55,0.3); text-decoration: none;
        }
        .nc-gold-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 36px rgba(212,175,55,0.45); }
        .nc-outline-btn {
          background: transparent; border: 1px solid rgba(212,175,55,0.4);
          color: #D4AF37; padding: 14px 32px; border-radius: 14px;
          font-weight: 600; font-size: 15px; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.2s ease; text-decoration: none;
        }
        .nc-outline-btn:hover { background: rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.7); transform: translateY(-1px); }
        .nc-cat-card:hover .nc-cat-img { transform: scale(1.08); }
        .nc-cat-card:hover .nc-cat-arrow { opacity: 1; transform: translateX(0); }
        .nc-cat-img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .nc-cat-arrow { opacity: 0; transform: translateX(-8px); transition: all 0.3s ease; }
        .nc-feat-card:hover { transform: translateY(-6px); box-shadow: 0 0 40px rgba(212,175,55,0.18) !important; }
        .nc-feat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .nc-brand-item { filter: grayscale(1) opacity(0.4); transition: all 0.3s ease; }
        .nc-brand-item:hover { filter: grayscale(0) opacity(1); transform: scale(1.06); }
        .nc-test-card:hover { transform: translateY(-4px); box-shadow: 0 0 36px rgba(212,175,55,0.12) !important; }
        .nc-test-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .nc-trend-card:hover { transform: translateY(-6px) scale(1.02); }
        .nc-trend-card { transition: transform 0.3s ease; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .nc-marquee { animation: marquee 22s linear infinite; }
      `}</style>

      <div className="nc-page" style={S.page}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 70% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)', top: -200, left: -150, pointerEvents: 'none' }} />
          <FloatingParticles count={18} />

          <div style={{ ...S.section, padding: '120px 32px 80px', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              {/* Left */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <SectionLabel>Premium Shopping Experience</SectionLabel>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="nc-display"
                  style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.0, marginBottom: 24, color: 'white' }}
                >
                  <TextType
                    text={["Welcome to"]}
                    typingSpeed={90}
                    pauseDuration={1500}
                    showCursor={false}
                    cursorCharacter="_"
                    loop={false}
                  />
                  <br />
                  <span style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <TextType
                      text={["NexCart"]}
                      initialDelay={900}
                      typingSpeed={90}
                      pauseDuration={1500}
                      showCursor={true}
                      cursorCharacter="_"
                      loop={false}
                    />
                  </span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 440, marginBottom: 40 }}>
                  Discover premium electronics, fashion, accessories and home essentials — curated for those who expect the best.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                  style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
                  <Link to="/products" className="nc-gold-btn">
                    Shop Collection <ArrowRight size={16} />
                  </Link>
                  <Link to="/products?category=Fashion" className="nc-outline-btn">
                    Explore Fashion
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[['50K+', 'Customers'], ['4.9★', 'Rating'], ['100+', 'Brands']].map(([v, l]) => (
                    <div key={l} style={{
                      background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 16, padding: '16px 14px',
                    }}>
                      <div className="nc-display" style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{v}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right — Hero Image */}
              <motion.div style={{ position: 'relative', y: heroY }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(212,175,55,0.15)',
                        '0 0 80px rgba(212,175,55,0.35)',
                        '0 0 40px rgba(212,175,55,0.15)'
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity
                    }}
                    style={{
                      borderRadius: 40,
                      overflow: 'hidden',
                      border: '1px solid rgba(212,175,55,0.25)',
                      position: 'relative',
                      width: 420,
                      height: 520
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImage}
                        src={heroImages[currentImage]}
                        alt="Premium Shopping"
                        initial={{
                          opacity: 0,
                          scale: 1.08
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.96
                        }}
                        transition={{
                          duration: 0.8
                        }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CURATED COLLECTIONS ───────────────────────────────────────────── */}
        <section style={S.divider}>
          <div style={S.section}>
            <SectionHeading
              label="Browse Categories"
              title="Curated Collections"
              subtitle="Explore our hand-selected categories, crafted for the modern lifestyle."
            />

            {/* CardSwap + Category Grid side by side */}
            {/* CardSwap + Categories List */}
            <div
              style={{
                display: 'flex',
                gap: 64,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 48,
              }}
            >
              {/* ── CardSwap Showcase ── */}
              <div
                style={{
                  flexShrink: 0,
                  width: 420,
                  height: 520,
                  position: 'relative',
                }}
              >
                <CardSwap
                  width={380}
                  height={480}
                  cardDistance={50}
                  verticalDistance={60}
                  delay={2800}
                  pauseOnHover={true}
                  skewAmount={5}
                  easing="elastic"
                >
                  {categories.map((cat) => (
                    <Card
                      key={cat.name}
                      style={{
                        border: '1px solid rgba(212,175,55,0.35)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        background: '#000',
                      }}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.08) 55%)',
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '22px 20px',
                        }}
                      >
                        <div
                          style={{
                            background: 'rgba(10,10,10,0.65)',
                            backdropFilter: 'blur(14px)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            borderRadius: 16,
                            padding: '14px 16px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: GOLD,
                              fontWeight: 600,
                              marginBottom: 4,
                              textTransform: 'uppercase',
                              letterSpacing: '0.09em',
                            }}
                          >
                            {cat.count} Products
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: 'white',
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              {cat.name}
                            </span>

                            <ChevronRight
                              size={17}
                              style={{ color: GOLD }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardSwap>
              </div>

              {/* ── Elegant Categories Navigation ── */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  maxWidth: 500,
                }}
              >
                <div
                  style={{
                    color: GOLD,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Shop By Category
                </div>

                <h3
                  style={{
                    fontSize: 46,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 12,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Discover Your
                  <br />
                  Perfect Collection
                </h3>

                {[
                  'Electronics',
                  'Fashion',
                  'Beauty',
                  'Accessories',
                  'Home',
                  'Sports',
                ].map((category, index) => (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <motion.div
                      whileHover={{ x: 12 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        backdropFilter: 'blur(12px)',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 18,
                        }}
                      >
                        <span
                          style={{
                            color: GOLD,
                            fontWeight: 700,
                            fontSize: 14,
                            minWidth: 30,
                          }}
                        >
                          0{index + 1}
                        </span>

                        <span
                          style={{
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          {category}
                        </span>
                      </div>

                      <ChevronRight
                        size={20}
                        style={{
                          color: GOLD,
                        }}
                      />
                    </motion.div>
                  </Link>
                ))}

                <p
                  style={{
                    marginTop: 12,
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  Browse premium products across multiple categories curated
                  specifically for modern lifestyles and everyday excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY NEXCART ──────────────────────────────────────────────────── */}
        <section style={{ ...S.divider, background: 'linear-gradient(180deg, #080808 0%, #0a0a08 50%, #080808 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Ambient glow blobs */}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', bottom: -80, left: -80, pointerEvents: 'none' }} />

          <div style={S.section}>
            <SectionHeading
              label="Our Promise"
              title="Why Customers Choose NexCart"
              subtitle="We deliver more than products — we deliver an experience worth returning to."
            />

            {/* Simple spacing between heading and feature cards */}
            <div
              style={{
                height: 40,
              }}
            />

            {/* Feature Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 28,
              }}
            >
              {features.map((f, i) => (
                <FadeUp key={f.title} delay={i * 0.08}>
                  <BorderGlow
                    edgeSensitivity={40}
                    glowColor="45 90 65"
                    backgroundColor="#080808"
                    borderRadius={24}
                    glowRadius={60}
                    glowIntensity={2.5}
                    coneSpread={22}
                    animated={true}
                    colors={[
                      '#D4AF37',
                      '#F4D03F',
                      '#B8860B',
                    ]}
                  >
                    <div
                      className="nc-feat-card"
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background:
                          'linear-gradient(145deg, rgba(18,16,6,0.95) 0%, rgba(8,8,8,0.98) 100%)',
                        borderRadius: 24,
                        padding: '32px 28px',
                        minHeight: 230,
                      }}
                    >
                      {/* Corner shimmer accent */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 120,
                          height: 120,
                          background:
                            'radial-gradient(circle at top right, rgba(212,175,55,0.08) 0%, transparent 65%)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Number badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 20,
                          right: 22,
                          fontSize: 11,
                          fontWeight: 800,
                          color: 'rgba(212,175,55,0.25)',
                          fontFamily: "'Playfair Display', serif",
                          letterSpacing: '0.05em',
                        }}
                      >
                        0{i + 1}
                      </div>

                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.12 }}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 16,
                          marginBottom: 20,
                          background:
                            'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(212,175,55,0.04))',
                          border: '1px solid rgba(212,175,55,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 16px rgba(212,175,55,0.1)',
                        }}
                      >
                        <f.icon size={22} style={{ color: GOLD }} />
                      </motion.div>

                      {/* Gold divider */}
                      <div
                        style={{
                          width: 32,
                          height: 2,
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
                          marginBottom: 14,
                        }}
                      />

                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'white',
                          marginBottom: 10,
                          fontFamily: "'Playfair Display', serif",
                          lineHeight: 1.35,
                        }}
                      >
                        {f.title}
                      </h3>

                      <p
                        style={{
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.55)',
                          lineHeight: 1.7,
                        }}
                      >
                        {f.desc}
                      </p>

                      {/* Bottom glow strip */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '20%',
                          right: '20%',
                          height: 1,
                          background:
                            'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
                        }}
                      />
                    </div>
                  </BorderGlow>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
        <section style={S.divider}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', top: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
            <div style={{ ...S.section, position: 'relative' }}>
              <SectionHeading label="Featured Products" title="Handpicked For You" subtitle="Explore the most loved products from our premium collection." />

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid rgba(212,175,55,0.2)`, borderTopColor: GOLD }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                  {featuredProducts.map((product, i) => (
                    <motion.div key={product._id}
                      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06, type: 'spring', damping: 18 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 56 }}>
                <Link to="/products" className="nc-gold-btn">
                  View Full Collection <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── BRANDS ───────────────────────────────────────────────────────── */}
        <section style={S.divider}>
          <div style={{ ...S.section, paddingTop: 80, paddingBottom: 80 }}>
            <SectionHeading label="Partners" title="Brands You Love" subtitle="Premium products from the world's most trusted names." />

            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div className="nc-marquee" style={{ display: 'flex', gap: 32, width: 'max-content' }}>
                {[...brands, ...brands].map((brand, i) => (
                  <div key={i} className="nc-brand-item" style={{
                    background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: 16, padding: '18px 32px', cursor: 'default', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section style={S.divider}>
          <div style={{ ...S.section, paddingTop: 80, paddingBottom: 80 }}>
            <FadeUp>
              <div style={{
                position: 'relative', borderRadius: 32, overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f0d05 0%, #0a0a0a 40%, #0f0d05 100%)',
                border: '1px solid rgba(212,175,55,0.25)', padding: '80px 64px',
                boxShadow: '0 0 80px rgba(212,175,55,0.08), inset 0 0 100px rgba(212,175,55,0.03)',
              }}>
                {/* BG decoration */}
                <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%)', top: -200, right: -100, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)', bottom: -100, left: -50, pointerEvents: 'none' }} />
                <FloatingParticles count={12} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                  <SectionLabel>Ready To Shop?</SectionLabel>
                  <h2 className="nc-display" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 18 }}>
                    Ready To Upgrade Your<br />
                    <span style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Shopping Experience?
                    </span>
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7, marginBottom: 44 }}>
                    Join thousands of customers discovering premium products every day.
                  </p>
                  <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/products" className="nc-gold-btn" style={{ fontSize: 16, padding: '16px 36px' }}>
                      Shop Now <ArrowRight size={17} />
                    </Link>
                    <Link to="/products" className="nc-outline-btn" style={{ fontSize: 16, padding: '16px 36px' }}>
                      Explore Categories
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

      </div>
    </>
  );
}