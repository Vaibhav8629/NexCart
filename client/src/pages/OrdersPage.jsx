import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

/* ─── Formatters ──────────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

/* ─── Status config ───────────────────────────────────────────── */
const STATUS = {
  pending:          { label: 'Pending',          glow: '#F59E0B', dot: '#F59E0B', step: 0 },
  packed:           { label: 'Packed',            glow: '#38BDF8', dot: '#38BDF8', step: 1 },
  shipped:          { label: 'Shipped',           glow: '#3B82F6', dot: '#3B82F6', step: 2 },
  out_for_delivery: { label: 'Out for Delivery',  glow: '#A78BFA', dot: '#A78BFA', step: 3 },
  delivered:        { label: 'Delivered',         glow: '#4ADE80', dot: '#4ADE80', step: 4 },
  cancelled:        { label: 'Cancelled',         glow: '#F87171', dot: '#F87171', step: -1 },
  payment_failed:   { label: 'Payment Failed',    glow: '#F87171', dot: '#F87171', step: -1 },
};

const ACTIVE_STATUSES = new Set(['pending', 'packed', 'shipped', 'out_for_delivery']);
const STEPS = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

/* ─── Helpers ─────────────────────────────────────────────────── */
function Particle({ style }) {
  return <div className="nc-particle" style={style} aria-hidden />;
}

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <span className="nc-badge" style={{ '--glow': cfg.glow, '--dot': cfg.dot }}>
      <span className="nc-badge-dot" />
      {cfg.label}
    </span>
  );
}

/* ─── Progress mini-tracker ───────────────────────────────────── */
function ProgressTracker({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  const current = cfg.step;
  if (current < 0) return null;
  return (
    <div className="nc-tracker">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`nc-tracker-step ${i < current ? 'done' : i === current ? 'active' : 'future'}`}>
            <div className="nc-tracker-dot">
              {i < current ? '✓' : i === current ? <span className="nc-tracker-pulse" /> : null}
            </div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`nc-tracker-line ${i < current ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Overlapping image stack ─────────────────────────────────── */
function ImgStack({ items }) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  return (
    <div className="nc-imgstack">
      {shown.map((item, i) => (
        <img
          key={i}
          className="nc-stackimg"
          style={{ zIndex: shown.length - i, marginLeft: i === 0 ? 0 : -18 }}
          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
          alt={item.name}
        />
      ))}
      {extra > 0 && (
        <div className="nc-stackmore" style={{ zIndex: 0, marginLeft: -18 }}>+{extra}</div>
      )}
    </div>
  );
}

/* ─── Active order card ───────────────────────────────────────── */
function ActiveCard({ order, onCancel, cancelling }) {
  const cfg = STATUS[order.status] || STATUS.pending;
  return (
    <motion.div
      className="nc-active-card"
      style={{ '--glow': cfg.glow }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nc-active-header">
        <div>
          <p className="nc-tiny-label">Order ID</p>
          <p className="nc-order-id">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="nc-active-body">
        <ImgStack items={order.items} />
        <div className="nc-active-info">
          <p className="nc-item-names">
            {order.items.slice(0, 2).map(i => i.name).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
          <p className="nc-item-meta">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {fmtDate(order.createdAt)}</p>
          <p className="nc-active-price">{fmt(order.totalAmount)}</p>
        </div>
      </div>

      <ProgressTracker status={order.status} />

      <div className="nc-active-footer">
        <Link to={`/orders/${order._id}`} className="nc-btn-detail">
          View Details →
        </Link>
        {order.status === 'pending' && (
          <button
            className="nc-btn-cancel"
            onClick={() => onCancel(order._id)}
            disabled={cancelling === order._id}
          >
            {cancelling === order._id ? 'Cancelling…' : '✕ Cancel Order'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── History card ────────────────────────────────────────────── */
function HistoryCard({ order, onCancel, cancelling, delay }) {
  const cfg = STATUS[order.status] || STATUS.pending;
  return (
    <motion.div
      className="nc-hist-card"
      style={{ '--glow': cfg.glow }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, borderColor: `rgba(${cfg.glow === '#D4AF37' ? '212,175,55' : '255,255,255'},0.25)` }}
    >
      <div className="nc-hist-top">
        <StatusBadge status={order.status} />
        <span className="nc-hist-date">{fmtDate(order.createdAt)}</span>
      </div>

      <ImgStack items={order.items} />

      <div className="nc-hist-mid">
        <p className="nc-hist-id">#{order._id.slice(-8).toUpperCase()}</p>
        <p className="nc-hist-items">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        <p className="nc-hist-price">{fmt(order.totalAmount)}</p>
      </div>

      <div className="nc-hist-footer">
        <Link to={`/orders/${order._id}`} className="nc-btn-detail">Details →</Link>
        {order.status === 'pending' && (
          <button
            className="nc-btn-cancel"
            onClick={() => onCancel(order._id)}
            disabled={cancelling === order._id}
          >
            {cancelling === order._id ? '…' : '✕ Cancel'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Shimmer skeleton ────────────────────────────────────────── */
function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div className="nc-shimmer" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function SkeletonPage() {
  return (
    <div className="nc-page">
      <div className="nc-wrap">
        <div style={{ marginBottom: 60 }}>
          <Shimmer w={120} h={12} r={6} style={{ marginBottom: 16 }} />
          <Shimmer w={220} h={48} r={10} style={{ marginBottom: 12 }} />
          <Shimmer w={340} h={14} r={6} style={{ marginBottom: 40 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[0,1,2,3].map(i => <Shimmer key={i} h={100} r={18} />)}
          </div>
        </div>
        <Shimmer w={160} h={12} r={6} style={{ marginBottom: 20 }} />
        {[0,1].map(i => <Shimmer key={i} h={200} r={22} style={{ marginBottom: 16 }} />)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function OrdersPage() {
  const { orders, fetchMyOrders, cancelOrder, loading } = useOrder();
  const { isAuthenticated } = useAuth();
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAuthenticated) fetchMyOrders();
  }, [isAuthenticated, fetchMyOrders]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try { await cancelOrder(id); } finally { setCancellingId(null); }
  };

  /* Derived data */
  const active   = useMemo(() => orders.filter(o => ACTIVE_STATUSES.has(o.status)), [orders]);
  const history  = useMemo(() => orders.filter(o => !ACTIVE_STATUSES.has(o.status)), [orders]);
  const totalSpent = useMemo(() => orders.reduce((s, o) => s + (o.totalAmount || 0), 0), [orders]);
  const delivered  = useMemo(() => orders.filter(o => o.status === 'delivered').length, [orders]);

  /* Filtered + searched list for history grid */
  const displayedHistory = useMemo(() => {
    let list = filter === 'active' ? active
             : filter === 'delivered' ? orders.filter(o => o.status === 'delivered')
             : filter === 'cancelled' ? orders.filter(o => o.status === 'cancelled' || o.status === 'payment_failed')
             : history;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o._id.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search, orders, active, history]);

  /* Particles */
  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 3,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    dur: Math.random() * 7 + 7,
    op: Math.random() * 0.45 + 0.1,
  })), []);

  /* ── NOT AUTHENTICATED ── */
  if (!isAuthenticated) return (
    <>
      <Styles />
      <div className="nc-page">
        <div className="nc-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(212,175,55,0.1) 0%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="nc-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="nc-access-panel">
            <div className="nc-access-icon">🔐</div>
            <h2 className="nc-access-title">Members Only</h2>
            <p className="nc-access-sub">Sign in to view your NexCart order history, track deliveries, and manage purchases.</p>
            <Link to="/login" className="nc-cta-gold">Login to Continue</Link>
          </motion.div>
        </div>
      </div>
    </>
  );

  /* ── LOADING ── */
  if (loading && orders.length === 0) return <><Styles /><SkeletonPage /></>;

  /* ── EMPTY ── */
  if (orders.length === 0) return (
    <>
      <Styles />
      <div className="nc-page">
        <div className="nc-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%)', top: 0, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="nc-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="nc-empty-icon">🛍️</div>
            <h2 className="nc-empty-title">No Orders Yet</h2>
            <p className="nc-empty-sub">Start exploring our premium collection and your orders will appear here.</p>
            <Link to="/products" className="nc-cta-gold">Explore Products</Link>
          </motion.div>
        </div>
      </div>
    </>
  );

  /* ── MAIN DASHBOARD ── */
  return (
    <>
      <Styles />
      <div className="nc-page">
        {/* Orbs */}
        <div className="nc-orb" style={{ width:600,height:600,background:'radial-gradient(circle,rgba(212,175,55,0.07) 0%,transparent 70%)',top:-200,left:-150 }} />
        <div className="nc-orb" style={{ width:400,height:400,background:'radial-gradient(circle,rgba(212,175,55,0.06) 0%,transparent 70%)',bottom:0,right:-100 }} />

        {/* Particles */}
        {particles.map(p => (
          <Particle key={p.id} style={{ width:p.size, height:p.size, top:`${p.top}%`, left:`${p.left}%`, '--dur':`${p.dur}s`, '--delay':`${p.delay}s`, '--op':p.op }} />
        ))}

        <div className="nc-wrap">

          {/* ═══ SECTION 1: HERO ═══ */}
          <section className="nc-hero">
            <motion.p className="nc-eyebrow" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}>
              NexCart Account
            </motion.p>
            <motion.h1 className="nc-hero-title" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.7,ease:[0.22,1,0.36,1]}}>
              My <span>Orders</span>
            </motion.h1>
            <motion.p className="nc-hero-sub" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6}}>
              Track purchases, monitor deliveries, and manage your shopping history in one place.
            </motion.p>

            {/* Stat cards */}
            <div className="nc-stats">
              {[
                { icon:'📦', value: orders.length,        label:'Total Orders' },
                { icon:'💳', value: fmt(totalSpent),      label:'Total Spent', accent: true },
                { icon:'✅', value: delivered,             label:'Delivered' },
                { icon:'⚡', value: active.length,         label:'Active Orders' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="nc-stat"
                  initial={{ opacity:0, y:24 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.4 + i*0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
                  whileHover={{ y:-4 }}
                >
                  <span className="nc-stat-icon">{s.icon}</span>
                  <p className="nc-stat-val" style={s.accent ? { color:'var(--gold-light)' } : {}}>{s.value}</p>
                  <p className="nc-stat-label">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ═══ SECTION 2: FILTERS + SEARCH ═══ */}
          <div className="nc-controls">
            <div className="nc-pills">
              {['all','active','delivered','cancelled'].map(f => (
                <button key={f} className={`nc-pill ${filter===f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="nc-search-wrap">
              <span className="nc-search-icon">🔍</span>
              <input
                className="nc-search"
                placeholder="Search by order ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ═══ SECTION 3: ACTIVE ORDERS ═══ */}
          {active.length > 0 && filter === 'all' && (
            <section className="nc-section">
              <p className="nc-sec-label">Active Orders <span className="nc-count">{active.length}</span></p>
              <AnimatePresence>
                <div className="nc-active-grid">
                  {active.map(order => (
                    <ActiveCard key={order._id} order={order} onCancel={handleCancel} cancelling={cancellingId} />
                  ))}
                </div>
              </AnimatePresence>
            </section>
          )}

          {/* ═══ SECTION 4: RECENT ACTIVITY TIMELINE ═══ */}
          {orders.length > 0 && filter === 'all' && (
            <section className="nc-section">
              <p className="nc-sec-label">Recent Activity</p>
              <div className="nc-timeline">
                {orders.slice(0, 5).map((o, i) => {
                  const cfg = STATUS[o.status] || STATUS.pending;
                  return (
                    <motion.div
                      key={o._id}
                      className="nc-tl-row"
                      initial={{ opacity:0, x:-16 }}
                      animate={{ opacity:1, x:0 }}
                      transition={{ delay: 0.1 + i*0.08, duration:0.5 }}
                    >
                      <div className="nc-tl-dot" style={{ background: cfg.glow, boxShadow:`0 0 12px ${cfg.glow}` }} />
                      {i < 4 && <div className="nc-tl-line" />}
                      <div className="nc-tl-content">
                        <p className="nc-tl-title">Order #{o._id.slice(-8).toUpperCase()}</p>
                        <p className="nc-tl-meta">{cfg.label} · {fmtDate(o.createdAt)} · {fmt(o.totalAmount)}</p>
                      </div>
                      <Link to={`/orders/${o._id}`} className="nc-tl-link">→</Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ SECTION 5: HISTORY GRID ═══ */}
          <section className="nc-section">
            <p className="nc-sec-label">
              {filter === 'all' ? 'Order History' : filter.charAt(0).toUpperCase() + filter.slice(1) + ' Orders'}
              {' '}<span className="nc-count">{displayedHistory.length}</span>
            </p>
            <AnimatePresence>
              {displayedHistory.length === 0 ? (
                <motion.p initial={{opacity:0}} animate={{opacity:1}} style={{ color:'var(--muted)', textAlign:'center', padding:'40px 0', fontSize:14 }}>
                  No orders match this filter.
                </motion.p>
              ) : (
                <div className="nc-hist-grid">
                  {displayedHistory.map((order, i) => (
                    <HistoryCard key={order._id} order={order} onCancel={handleCancel} cancelling={cancellingId} delay={i * 0.06} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STYLES                                                          */
/* ═══════════════════════════════════════════════════════════════ */
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

      :root {
        --gold:#D4AF37; --gold-light:#F0CC5A; --gold-dim:rgba(212,175,55,0.15);
        --border:rgba(212,175,55,0.2); --black:#0A0A0A;
        --surface:rgba(255,255,255,0.04); --surface-h:rgba(255,255,255,0.07);
        --text:#F5F0E8; --muted:rgba(245,240,232,0.45);
      }
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

      .nc-page {
        min-height:100vh; background:var(--black);
        font-family:'DM Sans',sans-serif; color:var(--text);
        position:relative; overflow-x:hidden;
      }
      .nc-page::before {
        content:''; position:fixed; inset:0;
        background-image:linear-gradient(rgba(212,175,55,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.025) 1px,transparent 1px);
        background-size:56px 56px; pointer-events:none; z-index:0;
      }
      .nc-orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
      .nc-particle {
        position:absolute; border-radius:50%;
        background:radial-gradient(circle,var(--gold-light),transparent);
        pointer-events:none;
        animation:ncFloat var(--dur,8s) var(--delay,0s) ease-in-out infinite alternate;
      }
      @keyframes ncFloat {
        from{transform:translate(0,0) scale(1);opacity:var(--op,.3);}
        to  {transform:translate(10px,-24px) scale(1.3);opacity:calc(var(--op,.3)*.3);}
      }

      .nc-wrap { position:relative;z-index:1;max-width:1040px;margin:0 auto;padding:60px 24px 100px; }

      /* ── Hero ── */
      .nc-hero { padding-bottom:56px; }
      .nc-eyebrow { font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:14px; }
      .nc-hero-title {
        font-family:'Cormorant Garamond',serif;font-size:clamp(42px,7vw,80px);font-weight:900;line-height:1;letter-spacing:-1px;margin-bottom:16px;
      }
      .nc-hero-title span { background:linear-gradient(135deg,#D4AF37 0%,#F5E070 50%,#C9960C 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
      .nc-hero-sub { font-size:15px;color:var(--muted);font-weight:300;max-width:480px;line-height:1.7;margin-bottom:40px; }

      /* Stats */
      .nc-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
      .nc-stat {
        background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:22px 18px;
        display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;cursor:default;
        transition:background .2s,border-color .2s,box-shadow .2s;
      }
      .nc-stat:hover { background:var(--surface-h);border-color:rgba(212,175,55,.4);box-shadow:0 8px 32px rgba(212,175,55,.08); }
      .nc-stat-icon{font-size:26px;line-height:1;}
      .nc-stat-val{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--text);line-height:1.1;}
      .nc-stat-label{font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}

      /* ── Controls ── */
      .nc-controls{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:44px;}
      .nc-pills{display:flex;gap:8px;flex-wrap:wrap;}
      .nc-pill{padding:8px 18px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;letter-spacing:.04em;}
      .nc-pill.active{background:var(--gold-dim);border-color:var(--gold);color:var(--gold-light);}
      .nc-pill:hover:not(.active){border-color:rgba(212,175,55,.3);color:var(--text);}
      .nc-search-wrap{position:relative;flex:1;min-width:200px;}
      .nc-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;}
      .nc-search{width:100%;padding:10px 16px 10px 38px;background:var(--surface);border:1px solid var(--border);border-radius:100px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;}
      .nc-search::placeholder{color:var(--muted);}
      .nc-search:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,.12);}

      /* ── Section label ── */
      .nc-section{margin-bottom:56px;}
      .nc-sec-label{font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:22px;display:flex;align-items:center;gap:12px;}
      .nc-sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(to right,var(--border),transparent);}
      .nc-count{background:var(--gold-dim);border:1px solid var(--border);border-radius:100px;padding:1px 8px;font-size:11px;color:var(--gold-light);}

      /* ── Badge ── */
      .nc-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:100px;border:1px solid rgba(255,255,255,0.12);font-size:11px;font-weight:600;letter-spacing:.05em;background:rgba(255,255,255,0.04);}
      .nc-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--dot);box-shadow:0 0 6px var(--glow);animation:badgePulse 2s ease-in-out infinite;}
      @keyframes badgePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(.8);}}

      /* ── Active card ── */
      .nc-active-grid{display:grid;gap:18px;}
      .nc-active-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:28px;transition:border-color .2s,box-shadow .2s;box-shadow:0 0 0 1px rgba(255,255,255,0.02) inset;}
      .nc-active-card:hover{border-color:rgba(212,175,55,.38);box-shadow:0 12px 48px rgba(0,0,0,.4),0 0 40px rgba(212,175,55,.06);}
      .nc-active-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:10px;}
      .nc-tiny-label{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:3px;}
      .nc-order-id{font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:var(--gold-light);letter-spacing:.08em;}
      .nc-active-body{display:flex;gap:20px;align-items:center;margin-bottom:24px;}
      .nc-active-info{flex:1;min-width:0;}
      .nc-item-names{font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .nc-item-meta{font-size:12px;color:var(--muted);margin-bottom:8px;}
      .nc-active-price{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--gold-light);}

      /* Progress tracker */
      .nc-tracker{display:flex;align-items:center;margin-bottom:24px;overflow-x:auto;padding-bottom:4px;}
      .nc-tracker-step{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:80px;}
      .nc-tracker-dot{width:36px;height:36px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:13px;position:relative;font-weight:700;}
      .nc-tracker-step.done .nc-tracker-dot{background:rgba(212,175,55,.18);border-color:var(--gold);color:var(--gold);}
      .nc-tracker-step.active .nc-tracker-dot{background:linear-gradient(135deg,#C9960C,#D4AF37,#F0CC5A);border-color:var(--gold-light);color:#0A0A0A;box-shadow:0 0 20px rgba(212,175,55,.5);}
      .nc-tracker-step.future .nc-tracker-dot{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.2);}
      .nc-tracker-step span{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;text-align:center;}
      .nc-tracker-step.done span{color:var(--gold);}
      .nc-tracker-step.active span{color:var(--gold-light);}
      .nc-tracker-step.future span{color:rgba(255,255,255,.2);}
      .nc-tracker-pulse{position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--gold);animation:trackerRipple 1.8s ease-out infinite;}
      @keyframes trackerRipple{0%{opacity:.8;transform:scale(1);}100%{opacity:0;transform:scale(1.6);}}
      .nc-tracker-line{flex:1;height:1px;background:rgba(212,175,55,.25);min-width:24px;margin-bottom:22px;}
      .nc-tracker-line.done{background:var(--gold);}

      /* Card footer */
      .nc-active-footer{display:flex;gap:12px;flex-wrap:wrap;}
      .nc-btn-detail{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;background:var(--gold-dim);border:1px solid var(--border);border-radius:10px;color:var(--gold-light);font-size:13px;font-weight:600;text-decoration:none;transition:background .2s,border-color .2s;}
      .nc-btn-detail:hover{background:rgba(212,175,55,.25);border-color:rgba(212,175,55,.5);}
      .nc-btn-cancel{padding:9px 18px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:10px;color:#F87171;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;}
      .nc-btn-cancel:hover{background:rgba(248,113,113,.16);}
      .nc-btn-cancel:disabled{opacity:.5;cursor:not-allowed;}

      /* ── Image stack ── */
      .nc-imgstack{display:flex;align-items:center;flex-shrink:0;}
      .nc-stackimg{width:56px;height:56px;object-fit:cover;border-radius:12px;border:2px solid rgba(255,255,255,.12);transition:transform .2s;background:rgba(255,255,255,.04);}
      .nc-stackimg:hover{transform:scale(1.08);z-index:10!important;}
      .nc-stackmore{width:56px;height:56px;border-radius:12px;border:2px dashed rgba(212,175,55,.3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--gold);background:var(--gold-dim);}

      /* ── Timeline ── */
      .nc-timeline{display:flex;flex-direction:column;gap:0;}
      .nc-tl-row{display:flex;align-items:center;gap:16px;position:relative;padding:12px 0;}
      .nc-tl-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
      .nc-tl-line{position:absolute;left:5px;top:24px;width:2px;height:calc(100% - 4px);background:linear-gradient(to bottom,rgba(212,175,55,.4),rgba(212,175,55,.1));pointer-events:none;}
      .nc-tl-content{flex:1;min-width:0;}
      .nc-tl-title{font-size:13px;font-weight:600;color:var(--text);}
      .nc-tl-meta{font-size:12px;color:var(--muted);margin-top:2px;}
      .nc-tl-link{color:var(--gold);font-size:14px;font-weight:700;text-decoration:none;flex-shrink:0;opacity:.7;transition:opacity .2s;}
      .nc-tl-link:hover{opacity:1;}

      /* ── History grid ── */
      .nc-hist-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
      .nc-hist-card{background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;display:flex;flex-direction:column;gap:16px;transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;cursor:default;}
      .nc-hist-card:hover{background:var(--surface-h);box-shadow:0 8px 32px rgba(0,0,0,.4);}
      .nc-hist-top{display:flex;justify-content:space-between;align-items:center;}
      .nc-hist-date{font-size:11px;color:var(--muted);font-weight:500;}
      .nc-hist-mid{display:flex;flex-direction:column;gap:4px;}
      .nc-hist-id{font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:var(--gold-light);}
      .nc-hist-items{font-size:12px;color:var(--muted);}
      .nc-hist-price{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--text);}
      .nc-hist-footer{display:flex;gap:10px;flex-wrap:wrap;}

      /* ── Access/Empty ── */
      .nc-access-panel{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:28px;padding:56px 48px;backdrop-filter:blur(20px);max-width:460px;}
      .nc-access-icon{font-size:56px;margin-bottom:24px;}
      .nc-access-title{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:700;color:var(--text);margin-bottom:12px;}
      .nc-access-sub{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:32px;font-weight:300;}
      .nc-empty-icon{font-size:72px;margin-bottom:24px;}
      .nc-empty-title{font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:700;color:var(--text);margin-bottom:12px;}
      .nc-empty-sub{font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:36px;font-weight:300;max-width:400px;}
      .nc-cta-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:linear-gradient(135deg,#C9960C 0%,#D4AF37 50%,#F0CC5A 100%);border:none;border-radius:14px;color:#0A0A0A;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-decoration:none;box-shadow:0 4px 24px rgba(212,175,55,.35);transition:transform .2s,box-shadow .2s;}
      .nc-cta-gold:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(212,175,55,.45);}

      /* ── Shimmer ── */
      .nc-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;display:block;}
      @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

      /* ── Responsive ── */
      @media(max-width:760px){
        .nc-stats{grid-template-columns:repeat(2,1fr);}
        .nc-hist-grid{grid-template-columns:1fr;}
        .nc-controls{flex-direction:column;align-items:stretch;}
        .nc-search-wrap{min-width:unset;}
        .nc-tracker{gap:0;}
        .nc-tracker-step{min-width:60px;}
      }
      @media(max-width:480px){
        .nc-stats{grid-template-columns:1fr 1fr;gap:10px;}
        .nc-hero-title{font-size:40px;}
        .nc-wrap{padding:40px 16px 80px;}
        .nc-access-panel{padding:36px 24px;}
      }
    `}</style>
  );
}