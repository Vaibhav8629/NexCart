import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Lock, Loader2, CreditCard, Check, Shield, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { confirmPaymentRequest } from '../lib/paymentApi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

/* ── Stripe init (outside component) ──────────────────────────────── */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

/* ── Stripe appearance ─────────────────────────────────────────────── */
const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#F59E0B',
    colorBackground: '#111113',
    colorText: '#f4f4f5',
    colorDanger: '#f87171',
    colorTextSecondary: '#71717a',
    borderRadius: '12px',
    fontFamily: 'inherit',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#0a0a0b',
      border: '1px solid rgba(255,255,255,0.09)',
      color: '#f4f4f5',
      padding: '12px 14px',
      transition: 'border 0.2s, box-shadow 0.2s',
    },
    '.Input:focus': {
      border: '1px solid rgba(245,158,11,0.65)',
      boxShadow: '0 0 0 3px rgba(245,158,11,0.10)',
      outline: 'none',
    },
    '.Label': { color: '#71717a', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600' },
    '.Tab': { backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.08)' },
    '.Tab--selected': { border: '1px solid rgba(245,158,11,0.6)', color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.06)' },
    '.Tab:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
    '.Block': { backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.08)' },
    '.Error': { color: '#f87171', fontSize: '12px' },
  },
};

/* ── Animation variants ────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1];

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
const leftVariants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 0.1 } },
};
const rightVariants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 0.2 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.07, duration: 0.38, ease: 'easeOut' } }),
};
const shakeVariants = {
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.45 } },
};

/* ── Step Pill ─────────────────────────────────────────────────────── */
function StepPill({ number, label, state }) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        animate={state === 'active' ? {
          boxShadow: [
            '0 0 0 0px rgba(245,158,11,0.45)',
            '0 0 0 7px rgba(245,158,11,0)',
            '0 0 0 0px rgba(245,158,11,0.45)',
          ],
        } : {}}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-300
          ${state === 'done' ? 'bg-emerald-500 text-white' : state === 'active' ? 'bg-amber-400 text-black' : 'bg-white/[0.06] border border-white/[0.12] text-zinc-600'}`}
      >
        {state === 'done'
          ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350 }}><Check className="h-3.5 w-3.5" /></motion.div>
          : number}
      </motion.div>
      <span className={`text-sm font-semibold transition-colors duration-300 ${state === 'active' ? 'text-amber-400' : state === 'done' ? 'text-emerald-400' : 'text-zinc-600'}`}>
        {label}
      </span>
    </div>
  );
}

/* ── Shipping Preview Card ─────────────────────────────────────────── */
function ShippingPreview({ address }) {
  const [expanded, setExpanded] = useState(false);
  if (!address) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4, ease }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm overflow-hidden mb-5"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Delivering to</p>
            <p className="text-sm text-zinc-200 font-semibold">{address.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 hidden sm:block">
            {address.city}, {address.state}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 flex items-start gap-2.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                {address.addressLine}, {address.city}, {address.state} {address.pincode}, {address.country}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Inner Stripe Form ─────────────────────────────────────────────── */
function CheckoutForm({ orderId, breakdown, onSuccess, onFailure }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage('');
    setShake(false);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/order-success` },
        redirect: 'if_required',
      });

      if (error) {
        const msg = error.message || 'Payment failed. Please try again.';
        setErrorMessage(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        if (paymentIntent?.id) confirmPaymentRequest(paymentIntent.id).catch(() => {});
        onFailure(msg);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        const order = await confirmPaymentRequest(paymentIntent.id);
        onSuccess(order);
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      onFailure(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe PaymentElement */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={mounted ? { opacity: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.5, ease }}
      >
        <PaymentElement options={{ layout: 'tabs', paymentMethodOrder: ['card', 'upi'] }} />
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease }}
            variants={shakeVariants}
            animate={shake ? 'shake' : { opacity: 1, y: 0, height: 'auto' }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          >
            <span className="text-red-400 mt-0.5 flex-shrink-0 text-base leading-none">⚠</span>
            <span className="text-sm text-red-400 leading-relaxed">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay button */}
      <motion.button
        type="submit"
        disabled={!stripe || processing}
        whileHover={!processing ? {
          y: -2,
          boxShadow: '0 8px 36px rgba(245,158,11,0.42), 0 0 0 1px rgba(245,158,11,0.28)',
        } : {}}
        whileTap={!processing ? { scale: 0.985, y: 0 } : {}}
        transition={{ duration: 0.18 }}
        className="w-full flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold py-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden relative"
      >
        {/* Subtle shimmer on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 relative z-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 relative z-10">
              <Lock className="h-4 w-4" />
              Pay {fmt(breakdown?.totalAmount)}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Security note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-center text-[11px] text-zinc-700 flex items-center justify-center gap-1.5"
      >
        <Lock className="h-3 w-3" />
        256-bit SSL · Secured by Stripe
      </motion.p>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const { clientSecret, paymentIntentId, orderId, breakdown, shippingAddress, coupon } = location.state || {};

  useEffect(() => {
    if (!clientSecret || !orderId) navigate('/checkout', { replace: true });
  }, [clientSecret, orderId, navigate]);

  const handleSuccess = useCallback((order) => {
    clearCart();
    toast.success('Payment Successful!');
    navigate('/order-success', { state: { order } });
  }, [clearCart, navigate]);

  const handleFailure = useCallback((reason) => {
    navigate('/payment-failed', { state: { reason, orderId, totalAmount: breakdown?.totalAmount } });
  }, [navigate, orderId, breakdown]);

  if (!clientSecret || !orderId) return null;

  const stripeOptions = { clientSecret, appearance: STRIPE_APPEARANCE };

  /* Pricing rows */
  const rows = [
    { label: 'Subtotal', value: fmt(breakdown?.subtotal), delay: 0 },
    breakdown?.couponDiscount > 0 && { label: `Coupon${coupon?.code ? ` (${coupon.code})` : ''}`, value: `-${fmt(breakdown.couponDiscount)}`, accent: 'text-emerald-400', delay: 1 },
    { label: 'Shipping', value: fmt(breakdown?.shipping), delay: 2 },
    { label: 'Tax (8%)', value: fmt(breakdown?.tax), delay: 3 },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55rem] h-[55rem] rounded-full bg-amber-500/[0.03] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-8%] w-[42rem] h-[42rem] rounded-full bg-violet-700/[0.035] blur-[110px]" />
        <div className="absolute top-[35%] right-[30%] w-[28rem] h-[28rem] rounded-full bg-amber-400/[0.02] blur-[90px]" />
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-10 pb-24"
      >
        {/* Top nav */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/checkout">
            <motion.div
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />Back to Shipping
            </motion.div>
          </Link>
          <div className="text-xs text-zinc-600 tracking-widest uppercase font-semibold">Payment</div>
        </div>

        {/* ── Step Indicator ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex items-center gap-0 mb-12 max-w-sm"
        >
          <StepPill number={1} label="Shipping" state="done" />
          <div className="flex-1 mx-3 h-px relative overflow-hidden rounded-full bg-white/[0.07] max-w-[60px]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.55, ease }}
              className="absolute inset-0 origin-left bg-gradient-to-r from-emerald-500 to-amber-400"
            />
          </div>
          <StepPill number={2} label="Payment" state="active" />
          <div className="flex-1 mx-3 h-px bg-white/[0.07] max-w-[60px] rounded-full" />
          <StepPill number={3} label="Done" state="idle" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">

          {/* ════ LEFT: PAYMENT FORM ════ */}
          <motion.div variants={leftVariants} initial="hidden" animate="visible" className="flex flex-col gap-5">

            {/* Shipping preview */}
            <ShippingPreview address={shippingAddress} />

            {/* Payment card */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0, filter: 'blur(6px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.2, duration: 0.55, ease }}
              className="rounded-2xl border border-white/[0.09] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <CreditCard className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Payment Details</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">Complete your purchase securely</p>
                  </div>
                </div>
                {/* Secure badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.35 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25"
                >
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold">Secure Checkout</span>
                </motion.div>
              </div>

              {/* Stripe form */}
              <div className="p-6 md:p-8">
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm
                    orderId={orderId}
                    breakdown={breakdown}
                    onSuccess={handleSuccess}
                    onFailure={handleFailure}
                  />
                </Elements>
              </div>
            </motion.div>
          </motion.div>

          {/* ════ RIGHT: ORDER SUMMARY ════ */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-2xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.06),0_0_0_1px_rgba(255,255,255,0.04)]">

              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.07]">
                <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Order Summary</h2>
                <p className="text-xs text-zinc-600 mt-0.5">Final receipt</p>
              </div>

              {/* Pricing rows */}
              {breakdown && (
                <div className="px-6 py-5 space-y-3">
                  {rows.map(({ label, value, accent, delay }) => (
                    <motion.div
                      key={label}
                      custom={delay}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-zinc-500">{label}</span>
                      <span className={`text-xs font-semibold tabular-nums ${accent || 'text-zinc-300'}`}>{value}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="mx-6 h-px bg-white/[0.07]" />

              {/* Total */}
              {breakdown && (
                <div className="px-6 py-5">
                  <div className="rounded-xl bg-amber-400/[0.07] border border-amber-400/20 px-5 py-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-400">Total</span>
                    <motion.span
                      key={breakdown.totalAmount}
                      initial={{ scale: 1.1, color: '#f59e0b' }}
                      animate={{ scale: 1, color: '#fbbf24' }}
                      transition={{ duration: 0.4, ease }}
                      className="text-2xl font-black tabular-nums text-amber-400"
                    >
                      {fmt(breakdown.totalAmount)}
                    </motion.span>
                  </div>
                </div>
              )}

              {/* Security assurance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mx-4 mb-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 px-4 py-3 flex items-center gap-2.5"
              >
                <Lock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] text-emerald-600 leading-relaxed">
                  Your payment is protected by 256-bit SSL encryption.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}