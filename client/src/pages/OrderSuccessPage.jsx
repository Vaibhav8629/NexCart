import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ─────────────────────────────────────────────────── */
const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

/* ─── Particle ────────────────────────────────────────────────── */
function Particle({ style }) {
  return <div className="particle" style={style} aria-hidden="true" />;
}

/* ─── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent, delay }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <span className="stat-icon">{icon}</span>
      <p className="stat-value" style={accent ? { color: 'var(--gold-light)' } : {}}>{value}</p>
      <p className="stat-label">{label}</p>
    </motion.div>
  );
}

/* ─── Timeline Step ───────────────────────────────────────────── */
function TimelineStep({ icon, label, active, done, delay }) {
  return (
    <motion.div
      className={`tl-step ${active ? 'tl-active' : done ? 'tl-done' : 'tl-future'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 180 }}
    >
      <div className="tl-dot">
        {done ? '✓' : icon}
        {active && <span className="tl-pulse" />}
      </div>
      <span className="tl-label">{label}</span>
    </motion.div>
  );
}

/* ─── What's Next Card ────────────────────────────────────────── */
function NextCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      className="next-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.5)', transition: { duration: 0.2 } }}
    >
      <span className="next-icon">{icon}</span>
      <p className="next-title">{title}</p>
      <p className="next-desc">{desc}</p>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order) navigate('/orders', { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  const estimatedDelivery = order.estimatedDelivery
    ? formatDate(order.estimatedDelivery)
    : formatDate(new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000));

  const shortId = order._id?.slice(-8).toUpperCase() ?? '--------';

  const handleCopy = () => {
    navigator.clipboard.writeText(order._id ?? shortId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    dur: Math.random() * 6 + 6,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  const timelineSteps = [
    { icon: '📋', label: 'Confirmed', active: true, done: false },
    { icon: '⚙️', label: 'Processing', active: false, done: false },
    { icon: '📦', label: 'Packed', active: false, done: false },
    { icon: '🚚', label: 'Shipped', active: false, done: false },
    { icon: '🏠', label: 'Delivered', active: false, done: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --gold: #D4AF37;
          --gold-light: #F0CC5A;
          --gold-dim: rgba(212,175,55,0.15);
          --gold-glow: rgba(212,175,55,0.3);
          --black: #080808;
          --surface: rgba(255,255,255,0.04);
          --surface-hov: rgba(255,255,255,0.07);
          --border: rgba(212,175,55,0.2);
          --text: #F5F0E8;
          --muted: rgba(245,240,232,0.45);
          --success: #6BCB77;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .os-page {
          min-height: 100vh;
          background: var(--black);
          font-family: 'Outfit', sans-serif;
          color: var(--text);
          position: relative;
          overflow-x: hidden;
        }

        /* ── Noise grain ── */
        .os-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* ── Grid overlay ── */
        .os-page::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Particles ── */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--gold-light), transparent);
          pointer-events: none;
          animation: floatParticle var(--dur, 8s) var(--delay, 0s) ease-in-out infinite alternate;
        }
        @keyframes floatParticle {
          0%   { transform: translate(0, 0) scale(1);   opacity: var(--op, 0.3); }
          100% { transform: translate(12px, -28px) scale(1.4); opacity: calc(var(--op, 0.3) * 0.4); }
        }

        /* ── Orb ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        /* ── Content wrapper ── */
        .os-wrap {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 24px 100px;
        }

        /* ══ HERO ══ */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 64px;
          position: relative;
        }

        /* Rings */
        .rings {
          position: relative;
          width: 160px;
          height: 160px;
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--gold);
          animation: ripple 2.4s ease-out infinite;
          opacity: 0;
        }
        .ring:nth-child(1) { width: 100%; height: 100%; animation-delay: 0s; }
        .ring:nth-child(2) { width: 140%; height: 140%; animation-delay: 0.6s; }
        .ring:nth-child(3) { width: 180%; height: 180%; animation-delay: 1.2s; }
        @keyframes ripple {
          0%   { opacity: 0.5; transform: scale(0.85); }
          100% { opacity: 0;   transform: scale(1.1);  }
        }

        .badge {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #2A2200, #0A0A0A);
          border: 2px solid var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 1px rgba(212,175,55,0.1) inset,
            0 0 48px rgba(212,175,55,0.35),
            0 0 100px rgba(212,175,55,0.12);
          z-index: 2;
          font-size: 52px;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 14px;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(38px, 7vw, 72px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -1px;
          color: var(--text);
          margin-bottom: 20px;
        }
        .hero-title span {
          background: linear-gradient(135deg, #D4AF37 0%, #F5E070 50%, #C9960C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 16px;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 36px;
        }

        /* Order ID pill */
        .order-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--gold-dim);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 10px 22px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .order-pill:hover {
          background: rgba(212,175,55,0.22);
          border-color: rgba(212,175,55,0.5);
          box-shadow: 0 0 24px rgba(212,175,55,0.18);
        }
        .order-pill-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
        }
        .order-pill-id {
          font-family: 'Courier New', monospace;
          font-size: 15px;
          font-weight: 700;
          color: var(--gold-light);
          letter-spacing: 0.1em;
        }
        .order-pill-copy {
          font-size: 12px;
          background: rgba(212,175,55,0.15);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 3px 10px;
          color: var(--gold);
          font-weight: 600;
          letter-spacing: 0.05em;
          transition: background 0.2s;
        }
        .order-pill:hover .order-pill-copy { background: rgba(212,175,55,0.3); }

        /* ══ Section header ══ */
        .sec-header {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sec-header::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, var(--border), transparent);
        }

        /* ══ Stat cards grid ══ */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 56px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .stat-card:hover {
          background: var(--surface-hov);
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 8px 32px rgba(212,175,55,0.08);
        }
        .stat-icon { font-size: 28px; line-height: 1; }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
        }

        /* ══ Timeline ══ */
        .timeline-wrap {
          margin-bottom: 56px;
          position: relative;
        }

        .timeline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
          padding: 0 0 16px;
        }

        /* connecting line */
        .timeline::before {
          content: '';
          position: absolute;
          top: 22px;
          left: 22px;
          right: 22px;
          height: 1px;
          background: linear-gradient(to right, var(--gold) 10%, rgba(212,175,55,0.15) 10%);
          z-index: 0;
        }

        .tl-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .tl-dot {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid;
          position: relative;
          transition: box-shadow 0.3s;
        }

        .tl-active .tl-dot {
          background: linear-gradient(135deg, #C9960C, #D4AF37, #F0CC5A);
          border-color: var(--gold-light);
          box-shadow: 0 0 20px rgba(212,175,55,0.5);
          color: #080808;
          font-size: 18px;
        }
        .tl-done .tl-dot {
          background: rgba(212,175,55,0.2);
          border-color: var(--gold);
          color: var(--gold);
        }
        .tl-future .tl-dot {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.2);
          font-size: 13px;
        }

        .tl-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid var(--gold);
          animation: tlPulse 1.8s ease-out infinite;
        }
        @keyframes tlPulse {
          0%   { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0;   transform: scale(1.6); }
        }

        .tl-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
        }
        .tl-active .tl-label { color: var(--gold-light); }
        .tl-done .tl-label   { color: var(--gold); }
        .tl-future .tl-label { color: rgba(255,255,255,0.2); }

        /* ══ Product cards ══ */
        .products-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 56px;
        }

        .product-card {
          display: flex;
          align-items: center;
          gap: 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 18px 22px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .product-card:hover {
          background: var(--surface-hov);
          border-color: rgba(212,175,55,0.38);
          transform: translateX(4px);
        }

        .product-img-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .product-img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .product-qty {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C9960C, #D4AF37);
          color: #080808;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-info { flex: 1; min-width: 0; }
        .product-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .product-meta {
          font-size: 12px;
          color: var(--muted);
        }

        .product-price {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--gold-light);
          flex-shrink: 0;
        }

        /* ══ What's Next ══ */
        .next-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 56px;
        }

        .next-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .next-card:hover {
          background: var(--surface-hov);
          box-shadow: 0 8px 32px rgba(212,175,55,0.06);
        }
        .next-icon { font-size: 32px; line-height: 1; }
        .next-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }
        .next-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
          font-weight: 300;
        }

        /* ══ Thank you banner ══ */
        .thankyou-banner {
          text-align: center;
          padding: 20px;
          margin-bottom: 40px;
          position: relative;
        }
        .thankyou-banner p {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-style: italic;
          color: var(--gold);
          letter-spacing: 0.08em;
          position: relative;
          z-index: 1;
        }
        .thankyou-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(212,175,55,0.07) 0%, transparent 70%);
          border-radius: 20px;
          animation: bannerGlow 3s ease-in-out infinite alternate;
        }
        @keyframes bannerGlow {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }

        /* ══ CTA ══ */
        .cta-row {
          display: flex;
          gap: 16px;
        }

        .btn-primary {
          flex: 1;
          padding: 16px 24px;
          background: linear-gradient(135deg, #C9960C 0%, #D4AF37 50%, #F0CC5A 100%);
          border: none;
          border-radius: 14px;
          color: #080808;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(212,175,55,0.35);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.6s;
        }
        .btn-primary:hover::before { transform: translateX(120%); }
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(212,175,55,0.45);
        }

        .btn-secondary {
          flex: 1;
          padding: 16px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(212,175,55,0.07);
          border-color: rgba(212,175,55,0.45);
          transform: translateY(-2px);
        }

        /* ── Responsive ── */
        @media (max-width: 760px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .next-grid  { grid-template-columns: 1fr; }
          .cta-row    { flex-direction: column; }
          .timeline::before { display: none; }
          .timeline { flex-wrap: wrap; gap: 20px; justify-content: flex-start; }
          .tl-step { flex: 0 0 calc(33.33% - 14px); }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .hero-title { font-size: 36px; }
          .os-wrap { padding: 40px 16px 80px; }
        }
      `}</style>

      <div className="os-page">
        {/* Ambient orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', top: -200, left: -200 }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', bottom: 100, right: -100 }} />

        {/* Particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              width: p.size,
              height: p.size,
              top: `${p.top}%`,
              left: `${p.left}%`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--op': p.opacity,
            }}
          />
        ))}

        <div className="os-wrap">
          {/* ══ HERO ══ */}
          <section className="hero">
            {/* Success badge + rings */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.7, times: [0, 0.7, 1], ease: 'easeOut' }}
            >
              <div className="rings">
                <div className="ring" />
                <div className="ring" />
                <div className="ring" />
                <div className="badge">✦</div>
              </div>
            </motion.div>

            <motion.p
              className="hero-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              NexCart · Purchase Complete
            </motion.p>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Order <span>Confirmed</span>
            </motion.h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              Thank you for shopping with NexCart. Your order has been received
              and is already being prepared for shipment.
            </motion.p>

            {/* Order ID pill */}
            <motion.button
              className="order-pill"
              onClick={handleCopy}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
              title="Click to copy order ID"
            >
              <span className="order-pill-label">Order</span>
              <span className="order-pill-id">#{shortId}</span>
              <span className="order-pill-copy">{copied ? '✓ Copied' : 'Copy'}</span>
            </motion.button>
          </section>

          {/* ══ STAT CARDS ══ */}
          <p className="sec-header">Order Summary</p>
          <div className="stats-grid">
            <StatCard icon="💳" label="Amount Paid" value={formatCurrency(order.totalAmount)} accent delay={1.0} />
            <StatCard icon="📅" label="Order Date"  value={formatDate(order.createdAt)} delay={1.1} />
            <StatCard icon="🚚" label="Est. Delivery" value={estimatedDelivery} delay={1.2} />
            <StatCard icon="📋" label="Status" value="Confirmed" delay={1.3} />
          </div>

          {/* ══ TIMELINE ══ */}
          <p className="sec-header">Delivery Journey</p>
          <div className="timeline-wrap">
            <div className="timeline">
              {timelineSteps.map((s, i) => (
                <TimelineStep key={s.label} {...s} delay={1.4 + i * 0.1} />
              ))}
            </div>
          </div>

          {/* ══ PRODUCTS ══ */}
          {order.items?.length > 0 && (
            <>
              <p className="sec-header">Items Ordered</p>
              <div className="products-grid">
                {order.items.map((item, i) => (
                  <motion.div
                    key={i}
                    className="product-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="product-img-wrap">
                      <img
                        className="product-img"
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                      />
                      <span className="product-qty">{item.quantity}</span>
                    </div>
                    <div className="product-info">
                      <p className="product-name">{item.name}</p>
                      <p className="product-meta">Qty {item.quantity} · {formatCurrency(item.price)} each</p>
                    </div>
                    <span className="product-price">{formatCurrency(item.price * item.quantity)}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* ══ WHAT'S NEXT ══ */}
          <p className="sec-header">What Happens Next?</p>
          <div className="next-grid">
            <NextCard icon="⚙️" title="Processing" desc="We are verifying and carefully preparing your order right now." delay={1.8} />
            <NextCard icon="📦" title="Shipping"   desc="You'll receive tracking updates as soon as your package ships." delay={1.95} />
            <NextCard icon="🏠" title="Delivery"   desc="Your package arrives safely at your doorstep within the estimated window." delay={2.1} />
          </div>

          {/* ══ THANK YOU BANNER ══ */}
          <motion.div
            className="thankyou-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            <p>✦ &nbsp; Thank you for choosing NexCart &nbsp; ✦</p>
          </motion.div>

          {/* ══ CTA ══ */}
          <motion.div
            className="cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.6 }}
          >
            <Link to="/orders" className="btn-primary">
              <span>📦</span> View My Orders
            </Link>
            <Link to="/products" className="btn-secondary">
              <span>🛍️</span> Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}