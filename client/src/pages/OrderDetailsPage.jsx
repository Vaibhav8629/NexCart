import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoice } from '../lib/invoiceGenerator';

/* ─── Formatters ─────────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ─── Config ─────────────────────────────────────────────────── */
const STEPS = [
  { key: 'pending',          label: 'Order Placed',      icon: '📋', desc: 'Your order has been received and confirmed.' },
  { key: 'packed',           label: 'Packed',            icon: '📦', desc: 'Your items have been carefully packed.' },
  { key: 'shipped',          label: 'Shipped',           icon: '🚚', desc: 'Your package is on its way.' },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: '🛵', desc: 'Your order is out for delivery today.' },
  { key: 'delivered',        label: 'Delivered',         icon: '✅', desc: 'Your order has been delivered.' },
];

const STATUS_META = {
  pending:          { glow: '#F59E0B', label: 'Pending',         emoji: '⏳' },
  packed:           { glow: '#38BDF8', label: 'Packed',           emoji: '📦' },
  shipped:          { glow: '#3B82F6', label: 'Shipped',          emoji: '🚚' },
  out_for_delivery: { glow: '#A78BFA', label: 'Out for Delivery', emoji: '🛵' },
  delivered:        { glow: '#4ADE80', label: 'Delivered',        emoji: '✅' },
  cancelled:        { glow: '#F87171', label: 'Cancelled',        emoji: '✕' },
  payment_failed:   { glow: '#F87171', label: 'Payment Failed',   emoji: '⚠️' },
};

const STATUS_DESC = {
  pending:          'Your order has been received and is awaiting processing.',
  packed:           'Your items have been packed and are ready to ship.',
  shipped:          'Your package is en route to your address.',
  out_for_delivery: 'Your delivery agent is on the way to you.',
  delivered:        'Your package has been delivered successfully.',
};

/* ─── Shimmer ────────────────────────────────────────────────── */
function Sh({ w = '100%', h = 20, r = 8 }) {
  return <div className="od-shimmer" style={{ width: w, height: h, borderRadius: r }} />;
}

function SkeletonPage() {
  return (
    <div className="od-page">
      <div className="od-wrap">
        <Sh w={100} h={12} r={6} />
        <div style={{ marginBottom: 48, marginTop: 32 }}>
          <Sh w={180} h={14} r={6} style={{ marginBottom: 14 }} />
          <Sh w={280} h={52} r={10} style={{ marginBottom: 14 }} />
          <Sh w={200} h={12} r={6} style={{ marginBottom: 36 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[0,1,2,3].map(i => <Sh key={i} h={90} r={18} />)}
          </div>
        </div>
        <Sh h={120} r={22} style={{ marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div><Sh h={260} r={22} style={{ marginBottom: 16 }} /><Sh h={200} r={22} /></div>
          <div><Sh h={180} r={22} style={{ marginBottom: 16 }} /><Sh h={150} r={22} /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Particle ───────────────────────────────────────────────── */
function Particle({ s }) {
  return (
    <div className="od-particle"
      style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`, '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, '--op': s.op }}
      aria-hidden />
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, cancelOrder, loading } = useOrder();
  const { isAuthenticated } = useAuth();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) fetchOrderById(id);
  }, [id, isAuthenticated, fetchOrderById]);

  const handleCancel = async () => {
    setCancelling(true);
    try { await cancelOrder(id); } finally { setCancelling(false); }
  };

  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, size: Math.random() * 5 + 3, top: Math.random() * 100,
    left: Math.random() * 100, delay: Math.random() * 5, dur: Math.random() * 7 + 7, op: Math.random() * 0.4 + 0.1,
  })), []);

  /* ── Not authenticated ── */
  if (!isAuthenticated) return (
    <>
      <Styles />
      <div className="od-page">
        <div className="od-wrap" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', textAlign:'center' }}>
          <motion.div className="od-access-panel" initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}>
            <div style={{ fontSize:56, marginBottom:20 }}>🔐</div>
            <h2 className="od-access-title">Members Only</h2>
            <p className="od-access-sub">Sign in to view your order details and track deliveries.</p>
            <Link to="/login" className="od-cta-gold">Login to Continue</Link>
          </motion.div>
        </div>
      </div>
    </>
  );

  /* ── Loading ── */
  if (loading && !currentOrder) return <><Styles /><SkeletonPage /></>;

  const order = currentOrder?._id === id ? currentOrder : null;

  /* ── Not found ── */
  if (!order) return (
    <>
      <Styles />
      <div className="od-page">
        <div className="od-wrap" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', textAlign:'center' }}>
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}>
            <div style={{ fontSize:72, marginBottom:20 }}>📭</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:42, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Order Not Found</h2>
            <p style={{ color:'var(--muted)', marginBottom:32, fontSize:15 }}>This order doesn't exist or you don't have access to it.</p>
            <Link to="/orders" className="od-cta-gold">← Back to Orders</Link>
          </motion.div>
        </div>
      </div>
    </>
  );

  const isCancelled     = order.status === 'cancelled';
  const isPaymentFailed = order.status === 'payment_failed';
  const meta            = STATUS_META[order.status] || STATUS_META.pending;
  const activeStepIdx   = (isCancelled || isPaymentFailed) ? -1
    : STEPS.map(s => s.key).lastIndexOf(order.status);

  const estimatedDelivery = order.estimatedDelivery
    ? fmtDate(order.estimatedDelivery)
    : fmtDate(new Date(new Date(order.createdAt).getTime() + 5 * 86400000));

  const daysRemaining = order.estimatedDelivery
    ? Math.max(0, Math.ceil((new Date(order.estimatedDelivery) - Date.now()) / 86400000))
    : null;

  return (
    <>
      <Styles />
      <div className="od-page">
        {/* Orbs */}
        <div className="od-orb" style={{ width:600, height:600, background:'radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%)', top:-200, left:-200 }} />
        <div className="od-orb" style={{ width:400, height:400, background:'radial-gradient(circle,rgba(212,175,55,0.06) 0%,transparent 70%)', bottom:-100, right:-100 }} />
        {particles.map(s => <Particle key={s.id} s={s} />)}

        <div className="od-wrap">

          {/* ── Back link ── */}
          <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:.5 }}>
            <Link to="/orders" className="od-back">← Back to Orders</Link>
          </motion.div>

          {/* ═══ SECTION 1: HERO ═══ */}
          <section className="od-hero">
            <motion.p className="od-eyebrow" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}>
              NexCart Order
            </motion.p>
            <motion.h1 className="od-hero-title" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2, duration:.7, ease:[.22,1,.36,1] }}>
              Order <span>#{order._id.slice(-8).toUpperCase()}</span>
            </motion.h1>
            <motion.p className="od-hero-sub" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}>
              Placed on {fmtDate(order.createdAt)}
            </motion.p>

            {/* Hero stat cards */}
            <div className="od-stats">
              {[
                { icon:'💳', label:'Order Total',     value: fmt(order.totalAmount), accent:true },
                { icon:'📦', label:'Items Ordered',   value: `${order.items?.length || 0} item${order.items?.length !== 1 ? 's' : ''}` },
                { icon:'✅', label:'Payment Status',  value: order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending',
                  color: order.paymentStatus === 'paid' ? '#4ADE80' : order.paymentStatus === 'failed' ? '#F87171' : '#F59E0B' },
                { icon:'🚀', label:'Est. Delivery',   value: estimatedDelivery },
              ].map((s, i) => (
                <motion.div key={s.label} className="od-stat"
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:.4 + i*.08, duration:.5, ease:[.22,1,.36,1] }}
                  whileHover={{ y:-4 }}>
                  <span className="od-stat-icon">{s.icon}</span>
                  <p className="od-stat-val" style={s.accent ? { color:'var(--gold-light)' } : s.color ? { color:s.color } : {}}>{s.value}</p>
                  <p className="od-stat-label">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ═══ SECTION 2: PROGRESS TRACKER ═══ */}
          {!isCancelled && !isPaymentFailed && (
            <motion.section className="od-section"
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:.6, duration:.6 }}>
              <p className="od-sec-label">Order Journey</p>
              <div className="od-tracker-card">
                <div className="od-tracker">
                  {STEPS.map((step, i) => {
                    const done    = i < activeStepIdx;
                    const current = i === activeStepIdx;
                    const future  = i > activeStepIdx;
                    return (
                      <React.Fragment key={step.key}>
                        <div className={`od-t-step ${done?'done':current?'active':'future'}`}>
                          <div className="od-t-dot">
                            {done ? '✓' : step.icon}
                            {current && <span className="od-t-pulse" />}
                          </div>
                          <span className="od-t-label">{step.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`od-t-line ${done ? 'done' : current ? 'half' : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Current status description */}
                <div className="od-status-desc" style={{ '--glow': meta.glow }}>
                  <span className="od-status-emoji">{meta.emoji}</span>
                  <div>
                    <p className="od-status-title" style={{ color: meta.glow }}>{meta.label}</p>
                    <p className="od-status-text">{STATUS_DESC[order.status] || 'Your order status has been updated.'}</p>
                  </div>
                  <span className="od-status-badge" style={{ '--glow': meta.glow }}>{meta.label}</span>
                </div>
              </div>
            </motion.section>
          )}

          {/* Cancelled / Payment Failed banners */}
          {isCancelled && (
            <motion.div className="od-alert red" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}>
              <span style={{ fontSize:32 }}>✕</span>
              <div>
                <p className="od-alert-title">Order Cancelled</p>
                {order.timeline?.find(t => t.status === 'cancelled') && (
                  <p className="od-alert-meta">{fmtDateTime(order.timeline.find(t => t.status === 'cancelled').timestamp)}</p>
                )}
                <p className="od-alert-note">{order.timeline?.find(t => t.status === 'cancelled')?.note || 'This order was cancelled.'}</p>
              </div>
            </motion.div>
          )}
          {isPaymentFailed && (
            <motion.div className="od-alert red" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}>
              <span style={{ fontSize:32 }}>⚠️</span>
              <div>
                <p className="od-alert-title">Payment Failed</p>
                {order.timeline?.find(t => t.status === 'payment_failed') && (
                  <p className="od-alert-meta">{fmtDateTime(order.timeline.find(t => t.status === 'payment_failed').timestamp)}</p>
                )}
                <p className="od-alert-note">{order.timeline?.find(t => t.status === 'payment_failed')?.note || 'Payment could not be processed.'}</p>
              </div>
            </motion.div>
          )}

          {/* ═══ MAIN GRID ═══ */}
          <div className="od-grid">

            {/* ── LEFT COLUMN ── */}
            <div className="od-left">

              {/* SECTION 3: Products */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.7 }}>
                <p className="od-sec-label">Products Ordered</p>
                <div className="od-products">
                  {order.items?.map((item, i) => (
                    <motion.div key={i} className="od-product-card"
                      initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay:.8 + i*.08, duration:.5, ease:[.22,1,.36,1] }}
                      whileHover={{ x:4 }}>
                      <div className="od-product-img-wrap">
                        <img className="od-product-img"
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                          alt={item.name} />
                        <span className="od-product-qty">{item.quantity}</span>
                      </div>
                      <div className="od-product-info">
                        <p className="od-product-name">{item.name}</p>
                        <p className="od-product-meta">{fmt(item.price)} × {item.quantity}</p>
                      </div>
                      <p className="od-product-total">{fmt(item.price * item.quantity)}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* SECTION 4: Activity Timeline */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.9 }}>
                <p className="od-sec-label">Activity Log</p>
                <div className="od-timeline-card">
                  {(isCancelled || isPaymentFailed
                    ? [{ key: order.status, label: meta.label, icon: meta.emoji }]
                    : STEPS
                  ).map((step, i) => {
                    const entry = order.timeline?.find(t => t.status === step.key);
                    const done  = !!entry;
                    const isLast = i === (isCancelled || isPaymentFailed ? 0 : STEPS.length - 1);
                    return (
                      <motion.div key={step.key} className="od-tl-row"
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:1.0 + i*.07 }}>
                        <div className="od-tl-left">
                          <div className={`od-tl-dot ${done ? 'done' : 'future'}`}>
                            {done ? step.icon : '○'}
                          </div>
                          {!isLast && <div className={`od-tl-line ${done ? 'done' : ''}`} />}
                        </div>
                        <div className="od-tl-content">
                          <p className={`od-tl-title ${done ? '' : 'muted'}`}>{step.label}</p>
                          {entry
                            ? <p className="od-tl-time">{fmtDateTime(entry.timestamp)}{entry.note ? ` · ${entry.note}` : ''}</p>
                            : <p className="od-tl-time faint">Pending</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="od-right">

              {/* SECTION 5: Payment Summary */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.75 }}>
                <p className="od-sec-label">Payment</p>
                <div className="od-pay-card">
                  <div className="od-pay-rows">
                    {[
                      { label:'Subtotal',  val: fmt(order.subtotal) },
                      { label:'Shipping',  val: fmt(order.shippingCost) },
                      { label:'Tax',       val: fmt(order.tax) },
                    ].map(r => (
                      <div key={r.label} className="od-pay-row">
                        <span className="od-pay-label">{r.label}</span>
                        <span className="od-pay-val">{r.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="od-pay-total-row">
                    <span>Total</span>
                    <span className="od-pay-total">{fmt(order.totalAmount)}</span>
                  </div>
                  <div className="od-pay-status">
                    <span className="od-pay-status-label">Payment Status</span>
                    <span className="od-pay-status-val" style={{
                      color: order.paymentStatus === 'paid' ? '#4ADE80'
                           : order.paymentStatus === 'failed' ? '#F87171' : '#F59E0B'
                    }}>
                      {order.paymentStatus === 'paid' ? '✓ Paid'
                       : order.paymentStatus === 'failed' ? '✕ Failed' : '⏳ Pending'}
                    </span>
                  </div>
                  {order.paymentMethod && (
                    <div className="od-pay-status">
                      <span className="od-pay-status-label">Method</span>
                      <span className="od-pay-status-val" style={{ color:'var(--text)' }}>{order.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* SECTION 6: Customer & Shipping */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.85 }}>
                <p className="od-sec-label">Delivery Info</p>
                <div className="od-info-card">
                  <div className="od-info-section">
                    <p className="od-info-head">👤 Customer</p>
                    <p className="od-info-line">{order.shippingAddress?.fullName}</p>
                    <p className="od-info-line muted">{order.shippingAddress?.email}</p>
                    <p className="od-info-line muted">{order.shippingAddress?.phone}</p>
                  </div>
                  <div className="od-info-divider" />
                  <div className="od-info-section">
                    <p className="od-info-head">📍 Ship To</p>
                    <p className="od-info-line">{order.shippingAddress?.addressLine}</p>
                    <p className="od-info-line muted">{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
                    <p className="od-info-line muted">{order.shippingAddress?.country}</p>
                  </div>
                </div>
              </motion.div>

              {/* SECTION 7: Estimated Delivery */}
              {!isCancelled && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.95 }}>
                  <div className="od-delivery-card">
                    <p className="od-delivery-label">🚀 Estimated Delivery</p>
                    <p className="od-delivery-date">{estimatedDelivery}</p>
                    {daysRemaining !== null && order.status !== 'delivered' && (
                      <p className="od-delivery-days">
                        {daysRemaining === 0 ? 'Arriving today!' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                      </p>
                    )}
                    {order.status === 'delivered' && <p className="od-delivery-days" style={{ color:'#4ADE80' }}>Delivered ✓</p>}
                  </div>
                </motion.div>
              )}

              {/* SECTION 8: Quick Actions */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.05 }}>
                <p className="od-sec-label">Actions</p>
                <div className="od-actions">
                  <button className="od-cta-gold" onClick={() => generateInvoice(order)}>
                    ↓ Download Invoice
                  </button>
                  <Link to="/orders" className="od-cta-glass">← My Orders</Link>
                  {order.status === 'pending' && (
                    <button className="od-cta-cancel" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? 'Cancelling…' : '✕ Cancel Order'}
                    </button>
                  )}
                  <button className="od-cta-glass" style={{ opacity:.5, cursor:'default' }} disabled>
                    📦 Track Shipment
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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

      .od-page {
        min-height:100vh; background:var(--black);
        font-family:'DM Sans',sans-serif; color:var(--text);
        position:relative; overflow-x:hidden;
      }
      .od-page::before {
        content:''; position:fixed; inset:0;
        background-image:linear-gradient(rgba(212,175,55,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.025) 1px,transparent 1px);
        background-size:56px 56px; pointer-events:none; z-index:0;
      }
      .od-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
      .od-particle {
        position:absolute;border-radius:50%;
        background:radial-gradient(circle,var(--gold-light),transparent);
        pointer-events:none;
        animation:odFloat var(--dur,8s) var(--delay,0s) ease-in-out infinite alternate;
      }
      @keyframes odFloat {
        from{transform:translate(0,0) scale(1);opacity:var(--op,.3);}
        to  {transform:translate(10px,-22px) scale(1.3);opacity:calc(var(--op,.3)*.3);}
      }

      .od-wrap { position:relative;z-index:1;max-width:1040px;margin:0 auto;padding:48px 24px 100px; }

      /* Back */
      .od-back { display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;margin-bottom:36px;letter-spacing:.04em;transition:color .2s; }
      .od-back:hover { color:var(--gold-light); }

      /* Hero */
      .od-hero { padding-bottom:48px; }
      .od-eyebrow { font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:14px; }
      .od-hero-title { font-family:'Cormorant Garamond',serif;font-size:clamp(38px,6vw,70px);font-weight:900;line-height:1.05;letter-spacing:-1px;margin-bottom:12px; }
      .od-hero-title span { background:linear-gradient(135deg,#D4AF37 0%,#F5E070 50%,#C9960C 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
      .od-hero-sub { font-size:15px;color:var(--muted);font-weight:300;margin-bottom:36px; }

      /* Stat cards */
      .od-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
      .od-stat { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;cursor:default;transition:background .2s,border-color .2s,box-shadow .2s; }
      .od-stat:hover { background:var(--surface-h);border-color:rgba(212,175,55,.4);box-shadow:0 8px 32px rgba(212,175,55,.08); }
      .od-stat-icon { font-size:24px;line-height:1; }
      .od-stat-val { font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--text);line-height:1.1; }
      .od-stat-label { font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted); }

      /* Section label */
      .od-sec-label { font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:flex;align-items:center;gap:10px; }
      .od-sec-label::after { content:'';flex:1;height:1px;background:linear-gradient(to right,var(--border),transparent); }
      .od-section { margin-bottom:44px; }

      /* Tracker card */
      .od-tracker-card { background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:32px 28px;margin-bottom:44px; }
      .od-tracker { display:flex;align-items:center;margin-bottom:28px;overflow-x:auto;padding-bottom:4px; }
      .od-t-step { display:flex;flex-direction:column;align-items:center;gap:8px;min-width:90px; }
      .od-t-dot { width:44px;height:44px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;position:relative;transition:box-shadow .3s; }
      .od-t-step.done .od-t-dot { background:rgba(212,175,55,.18);border-color:var(--gold);color:var(--gold);font-size:16px; }
      .od-t-step.active .od-t-dot { background:linear-gradient(135deg,#C9960C,#D4AF37,#F0CC5A);border-color:var(--gold-light);color:#0A0A0A;box-shadow:0 0 24px rgba(212,175,55,.55); }
      .od-t-step.future .od-t-dot { background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.25);font-size:13px; }
      .od-t-pulse { position:absolute;inset:-7px;border-radius:50%;border:2px solid var(--gold);animation:odPulse 1.8s ease-out infinite; }
      @keyframes odPulse { 0%{opacity:.8;transform:scale(1);}100%{opacity:0;transform:scale(1.65);} }
      .od-t-label { font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;text-align:center; }
      .od-t-step.done .od-t-label { color:var(--gold); }
      .od-t-step.active .od-t-label { color:var(--gold-light); }
      .od-t-step.future .od-t-label { color:rgba(255,255,255,.2); }
      .od-t-line { flex:1;height:2px;min-width:24px;margin-bottom:28px; }
      .od-t-line.done { background:linear-gradient(to right,var(--gold),rgba(212,175,55,.4)); }
      .od-t-line.half { background:linear-gradient(to right,var(--gold) 50%,rgba(255,255,255,.08) 50%); }
      .od-t-line:not(.done):not(.half) { background:rgba(255,255,255,.08); }

      /* Status desc */
      .od-status-desc { display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:18px 22px;border-left:3px solid var(--glow); }
      .od-status-emoji { font-size:28px;flex-shrink:0;filter:drop-shadow(0 0 8px var(--glow)); }
      .od-status-title { font-size:15px;font-weight:700;margin-bottom:3px; }
      .od-status-text { font-size:13px;color:var(--muted);font-weight:300;line-height:1.5; }
      .od-status-badge { margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;padding:4px 14px;border-radius:100px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--glow);box-shadow:0 0 12px rgba(0,0,0,.4); }

      /* Alert */
      .od-alert { display:flex;align-items:flex-start;gap:20px;padding:24px 28px;border-radius:20px;margin-bottom:40px;border:1px solid; }
      .od-alert.red { background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.25); }
      .od-alert-title { font-size:16px;font-weight:700;color:#F87171;margin-bottom:4px; }
      .od-alert-meta { font-size:12px;color:var(--muted);margin-bottom:4px; }
      .od-alert-note { font-size:13px;color:var(--muted);font-weight:300;line-height:1.5; }

      /* Main grid */
      .od-grid { display:grid;grid-template-columns:2fr 1fr;gap:28px; }
      .od-left,.od-right { display:flex;flex-direction:column;gap:36px; }

      /* Products */
      .od-products { display:flex;flex-direction:column;gap:12px; }
      .od-product-card { display:flex;align-items:center;gap:18px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px 20px;transition:background .2s,border-color .2s,transform .2s; }
      .od-product-card:hover { background:var(--surface-h);border-color:rgba(212,175,55,.38);box-shadow:0 4px 24px rgba(0,0,0,.3); }
      .od-product-img-wrap { position:relative;flex-shrink:0; }
      .od-product-img { width:72px;height:72px;object-fit:cover;border-radius:14px;border:1px solid var(--border);display:block; }
      .od-product-qty { position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#C9960C,#D4AF37);color:#0A0A0A;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center; }
      .od-product-info { flex:1;min-width:0; }
      .od-product-name { font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .od-product-meta { font-size:12px;color:var(--muted); }
      .od-product-total { font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--gold-light);flex-shrink:0; }

      /* Timeline */
      .od-timeline-card { background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:28px 24px; }
      .od-tl-row { display:flex;gap:18px;align-items:flex-start; }
      .od-tl-left { display:flex;flex-direction:column;align-items:center;width:36px;flex-shrink:0; }
      .od-tl-dot { width:36px;height:36px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:box-shadow .3s; }
      .od-tl-dot.done { background:rgba(212,175,55,.15);border-color:var(--gold);box-shadow:0 0 12px rgba(212,175,55,.25); }
      .od-tl-dot.future { background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.25);font-size:13px; }
      .od-tl-line { flex:1;width:2px;min-height:28px;margin:4px 0; }
      .od-tl-line.done { background:linear-gradient(to bottom,var(--gold),rgba(212,175,55,.2)); }
      .od-tl-line:not(.done) { background:rgba(255,255,255,.08); }
      .od-tl-content { flex:1;padding-bottom:20px; }
      .od-tl-title { font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px; }
      .od-tl-title.muted { color:rgba(245,240,232,.3); }
      .od-tl-time { font-size:12px;color:var(--muted); }
      .od-tl-time.faint { color:rgba(245,240,232,.2); }

      /* Payment card */
      .od-pay-card { background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:24px;overflow:hidden; }
      .od-pay-rows { display:flex;flex-direction:column;gap:10px;margin-bottom:16px; }
      .od-pay-row { display:flex;justify-content:space-between;font-size:13px; }
      .od-pay-label { color:var(--muted); }
      .od-pay-val { color:var(--text);font-weight:500; }
      .od-pay-total-row { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px; }
      .od-pay-total { font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--gold-light); }
      .od-pay-status { display:flex;justify-content:space-between;font-size:12px;margin-top:8px; }
      .od-pay-status-label { color:var(--muted);font-weight:500;text-transform:uppercase;letter-spacing:.1em; }
      .od-pay-status-val { font-weight:700; }

      /* Info card */
      .od-info-card { background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:24px; }
      .od-info-section { margin-bottom:16px; }
      .od-info-section:last-child { margin-bottom:0; }
      .od-info-head { font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:10px; }
      .od-info-line { font-size:13px;color:var(--text);margin-bottom:4px;line-height:1.5; }
      .od-info-line.muted { color:var(--muted);font-size:12px; }
      .od-info-divider { height:1px;background:var(--border);margin:16px 0; }

      /* Delivery card */
      .od-delivery-card { background:linear-gradient(135deg,rgba(212,175,55,.08),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.3);border-radius:20px;padding:24px;text-align:center;animation:deliveryGlow 3s ease-in-out infinite alternate; }
      @keyframes deliveryGlow { from{box-shadow:0 0 24px rgba(212,175,55,.08);}to{box-shadow:0 0 40px rgba(212,175,55,.18);} }
      .od-delivery-label { font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;font-weight:600; }
      .od-delivery-date { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--text);margin-bottom:6px; }
      .od-delivery-days { font-size:13px;color:var(--gold-light);font-weight:500; }

      /* Actions */
      .od-actions { display:flex;flex-direction:column;gap:10px; }
      .od-cta-gold { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;background:linear-gradient(135deg,#C9960C 0%,#D4AF37 50%,#F0CC5A 100%);border:none;border-radius:14px;color:#0A0A0A;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-decoration:none;cursor:pointer;box-shadow:0 4px 20px rgba(212,175,55,.3);transition:transform .2s,box-shadow .2s; }
      .od-cta-gold:hover { transform:translateY(-2px);box-shadow:0 8px 32px rgba(212,175,55,.45); }
      .od-cta-glass { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;background:var(--surface);border:1px solid var(--border);border-radius:14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:background .2s,border-color .2s,transform .2s; }
      .od-cta-glass:hover:not([disabled]) { background:var(--surface-h);border-color:rgba(212,175,55,.4);transform:translateY(-1px); }
      .od-cta-cancel { display:inline-flex;align-items:center;justify-content:center;padding:13px 20px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:14px;color:#F87171;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s; }
      .od-cta-cancel:hover:not(:disabled) { background:rgba(248,113,113,.16); }
      .od-cta-cancel:disabled { opacity:.5;cursor:not-allowed; }

      /* Access panel */
      .od-access-panel { background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:28px;padding:56px 48px;backdrop-filter:blur(20px);max-width:440px;text-align:center; }
      .od-access-title { font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:700;color:var(--text);margin-bottom:12px; }
      .od-access-sub { font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:28px;font-weight:300; }

      /* Shimmer */
      .od-shimmer { background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;display:block; }
      @keyframes shimmer { 0%{background-position:200% 0;}100%{background-position:-200% 0;} }

      /* Responsive */
      @media(max-width:800px) {
        .od-grid{grid-template-columns:1fr;}
        .od-stats{grid-template-columns:repeat(2,1fr);}
        .od-tracker{gap:0;}
        .od-t-step{min-width:70px;}
      }
      @media(max-width:480px) {
        .od-stats{grid-template-columns:1fr 1fr;gap:10px;}
        .od-hero-title{font-size:36px;}
        .od-wrap{padding:32px 16px 80px;}
        .od-access-panel{padding:36px 20px;}
      }
    `}</style>
  );
}