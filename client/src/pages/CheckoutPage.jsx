import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowLeft, MapPin, User, Phone, Mail,
  CreditCard, Loader2, Check, ChevronDown, Tag, X, Shield,
  Sparkles, Package
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentIntentRequest } from '../lib/paymentApi';
import { removeCouponRequest, validateCouponRequest } from '../lib/couponApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const INITIAL_FORM = {
  fullName: '', email: '', phone: '', addressLine: '',
  city: '', state: '', pincode: '', country: 'India',
};

/* ─── animation variants ───────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.15 + i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

/* ─── sub-components ───────────────────────────────────────────────── */

/** Animated input with focus glow + icon colour transition */
function Field({ name, label, placeholder, icon: Icon, type = 'text', value, onChange, error, index = 0 }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div custom={index} variants={fieldVariants} initial="hidden" animate="visible" className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</label>
      <div className="relative group">
        <motion.div
          animate={{ color: focused ? '#f59e0b' : '#71717a' }}
          transition={{ duration: 0.2 }}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <Icon className="h-4 w-4" />
        </motion.div>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/[0.04] text-zinc-100
            placeholder:text-zinc-600 outline-none transition-all duration-200
            border ${focused
              ? 'border-amber-400/70 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
              : error
                ? 'border-red-500/60 shadow-[0_0_0_2px_rgba(239,68,68,0.08)]'
                : 'border-white/10 hover:border-white/20'
            }
          `}
        />
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent origin-center"
            />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-400 flex items-center gap-1 overflow-hidden"
          >
            <X className="h-3 w-3" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Step indicator pill */
function StepPill({ number, label, state }) {
  // state: 'done' | 'active' | 'idle'
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        animate={
          state === 'active'
            ? { boxShadow: ['0 0 0 0px rgba(245,158,11,0.4)', '0 0 0 6px rgba(245,158,11,0)', '0 0 0 0px rgba(245,158,11,0.4)'] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 2 }}
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
          ${state === 'done' ? 'bg-emerald-500 text-white' : state === 'active' ? 'bg-amber-400 text-black' : 'bg-white/8 border border-white/15 text-zinc-500'}
        `}
      >
        {state === 'done' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Check className="h-4 w-4" />
          </motion.div>
        ) : number}
      </motion.div>
      <span className={`text-sm font-semibold transition-colors duration-300 ${state === 'active' ? 'text-amber-400' : state === 'done' ? 'text-emerald-400' : 'text-zinc-600'}`}>
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { cartItems, cartTotal, validateCartStock } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    fullName: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const summaryRef = useRef(null);
  const summaryInView = useInView(summaryRef, { once: true });

  /* ── derived ── */
  const shipping = cartTotal > 0 ? 15 : 0;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(cartTotal - couponDiscount, 0) + shipping + tax;

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Valid email is required.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.addressLine.trim()) next.addressLine = 'Address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.state.trim()) next.state = 'State is required.';
    if (!form.pincode.trim()) next.pincode = 'Pincode is required.';
    if (!form.country.trim()) next.country = 'Country is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (cartItems.length === 0) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const { valid, errors: stockErrors } = await validateCartStock();
      if (!valid) {
        stockErrors.forEach((msg) => toast.error(msg, { duration: 5000 }));
        setLoading(false);
        return;
      }
      const shippingAddress = {
        fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(),
        addressLine: form.addressLine.trim(), city: form.city.trim(), state: form.state.trim(),
        pincode: form.pincode.trim(), country: form.country.trim(),
      };
      const payload = {
        items: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress, shippingCost: shipping, couponCode: appliedCoupon?.code || '',
      };
      const result = await createPaymentIntentRequest(payload);
      navigate('/payment', {
        state: {
          clientSecret: result.clientSecret, paymentIntentId: result.paymentIntentId,
          orderId: result.orderId, breakdown: result.breakdown,
          coupon: result.coupon, shippingAddress,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Failed to initialise payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponError('Enter a coupon code.'); return; }
    setCouponLoading(true);
    try {
      const result = await validateCouponRequest({ code, subtotal: cartTotal });
      setAppliedCoupon(result.coupon);
      setCouponCode(result.coupon?.code || code);
      setCouponError('');
      toast.success('Coupon applied!');
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.message || 'Invalid coupon.');
      toast.error(error.message || 'Invalid coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try { await removeCouponRequest({ code: appliedCoupon?.code || couponCode.trim() }); } catch { /* silent */ }
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.success('Coupon removed.');
  };

  /* ── empty cart ── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="inline-flex p-7 rounded-3xl bg-amber-400/10 border border-amber-400/20 mb-6">
            <ShoppingBag className="h-14 w-14 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Add some items to your cart before checking out.</p>
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="bg-amber-400 text-black font-bold px-8 py-3.5 rounded-2xl text-sm tracking-wide"
            >
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55rem] h-[55rem] rounded-full bg-amber-500/[0.035] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-8%] w-[45rem] h-[45rem] rounded-full bg-violet-700/[0.04] blur-[100px]" />
        <div className="absolute top-[40%] left-[45%] w-[30rem] h-[30rem] rounded-full bg-amber-400/[0.025] blur-[90px]" />
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-10 pb-24"
      >
        {/* Top nav */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/cart">
            <motion.div
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />Back to Cart
            </motion.div>
          </Link>
          <div className="text-xs text-zinc-600 tracking-widest uppercase font-semibold">Checkout</div>
        </div>

        {/* ── Step Indicator ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex items-center gap-0 mb-12 max-w-sm"
        >
          <StepPill number={1} label="Shipping" state="active" />
          <div className="flex-1 mx-3 h-px relative overflow-hidden rounded-full bg-white/[0.07] max-w-[60px]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 origin-left bg-gradient-to-r from-amber-400 to-amber-300"
            />
          </div>
          <StepPill number={2} label="Payment" state="idle" />
          <div className="flex-1 mx-3 h-px bg-white/[0.07] max-w-[60px] rounded-full" />
          <StepPill number={3} label="Done" state="idle" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">

          {/* ════════ LEFT: FORM AREA ════════ */}
          <div className="flex flex-col gap-6">

            {/* ── Customer Information ── */}
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                {/* card header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                  <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <User className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Customer Information</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">Your contact and personal details</p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'fullName', label: 'Full Name', placeholder: 'John Doe', icon: User, index: 0 },
                    { name: 'email', label: 'Email Address', placeholder: 'john@example.com', icon: Mail, type: 'email', index: 1 },
                    { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', icon: Phone, type: 'tel', index: 2 },
                    { name: 'addressLine', label: 'Address', placeholder: '123, Park Street', icon: MapPin, index: 3, className: 'sm:col-span-2' },
                  ].map(({ className, ...fieldProps }) => (
                    <div key={fieldProps.name} className={className}>
                      <Field
                        {...fieldProps}
                        value={form[fieldProps.name]}
                        onChange={handleChange}
                        error={errors[fieldProps.name]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Shipping Address ── */}
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                  <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <MapPin className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Shipping Address</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">Where should we deliver?</p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  {[
                    { name: 'city', label: 'City', placeholder: 'Mumbai', icon: MapPin, index: 4 },
                    { name: 'state', label: 'State', placeholder: 'Maharashtra', icon: MapPin, index: 5 },
                    { name: 'pincode', label: 'Pincode', placeholder: '400001', icon: MapPin, index: 6 },
                    { name: 'country', label: 'Country', placeholder: 'India', icon: MapPin, index: 7 },
                  ].map((fieldProps) => (
                    <Field
                      key={fieldProps.name}
                      {...fieldProps}
                      value={form[fieldProps.name]}
                      onChange={handleChange}
                      error={errors[fieldProps.name]}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mobile: show CTA here too */}
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="lg:hidden">
              <ProceedButton loading={loading} onClick={handleProceedToPayment} />
            </motion.div>
          </div>

          {/* ════════ RIGHT: ORDER SUMMARY ════════ */}
          <motion.div
            ref={summaryRef}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate={summaryInView ? 'visible' : 'hidden'}
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-2xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.06),0_0_0_1px_rgba(255,255,255,0.04)]">

              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Order Summary</h2>
                </div>
                <span className="text-xs text-zinc-600 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.08]">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items list */}
              <div className="px-6 py-4 space-y-3 max-h-56 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                <AnimatePresence>
                  {cartItems.map((item, i) => (
                    <motion.div
                      key={item._id}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-3 rounded-xl p-2 -mx-2 cursor-default"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        />
                        <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 min-w-[18px] flex items-center justify-center rounded-full bg-amber-400 text-black text-[10px] font-bold leading-none px-1">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{item.category}</p>
                      </div>
                      <p className="text-xs font-bold text-zinc-100 tabular-nums flex-shrink-0">
                        {fmt((item.discountPrice || item.price) * item.quantity)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-white/[0.07]" />

              {/* Pricing breakdown */}
              <div className="px-6 py-5 space-y-2.5">
                {[
                  { label: 'Subtotal', value: fmt(cartTotal), delay: 0 },
                  { label: 'Shipping', value: fmt(shipping), delay: 1 },
                  { label: 'Tax (8%)', value: fmt(tax), delay: 2 },
                  ...(couponDiscount > 0 ? [{ label: 'Coupon Discount', value: `-${fmt(couponDiscount)}`, accent: 'text-emerald-400', delay: 3 }] : []),
                ].map(({ label, value, accent, delay }) => (
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

              {/* Coupon panel */}
              <div className="mx-4 mb-4 rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
                <button
                  onClick={() => setCouponOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    <span className="font-semibold">{appliedCoupon ? `Coupon: ${appliedCoupon.code}` : 'Have a coupon code?'}</span>
                    {appliedCoupon && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30"
                      >
                        SAVED
                      </motion.span>
                    )}
                  </div>
                  <motion.div animate={{ rotate: couponOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {couponOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex flex-col gap-2.5">
                        <div className="mx-0 h-px bg-white/[0.07]" />
                        {appliedCoupon ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-emerald-300">{appliedCoupon.code}</p>
                                <p className="text-[11px] text-emerald-500/70">You save {fmt(couponDiscount)}</p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-[11px] text-red-400 hover:text-red-300 transition-colors font-medium"
                            >
                              Remove
                            </button>
                          </motion.div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="SAVE10"
                              className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border border-white/10 focus:border-amber-400/50 text-zinc-100 placeholder:text-zinc-700 outline-none transition-all uppercase tracking-widest font-mono"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={couponLoading}
                              className="px-4 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors disabled:opacity-50 shrink-0"
                            >
                              {couponLoading ? '...' : 'Apply'}
                            </button>
                          </div>
                        )}
                        <AnimatePresence>
                          {couponError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="text-[11px] text-red-400 flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />{couponError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total */}
              <div className="mx-4 mb-4 rounded-xl bg-amber-400/[0.07] border border-amber-400/20 px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-400">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.08, color: '#f59e0b' }}
                  animate={{ scale: 1, color: '#fbbf24' }}
                  transition={{ duration: 0.35 }}
                  className="text-2xl font-black tabular-nums text-amber-400"
                >
                  {fmt(total)}
                </motion.span>
              </div>

              {/* CTA */}
              <div className="px-4 pb-6 hidden lg:block">
                <ProceedButton loading={loading} onClick={handleProceedToPayment} />
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-700">
                  <Shield className="h-3 w-3" />
                  <span>Secured by Stripe · 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Proceed button with glow + lift ──────────────────────────────── */
function ProceedButton({ loading, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={!loading ? {
        y: -2,
        boxShadow: '0 8px 32px rgba(245,158,11,0.4), 0 0 0 1px rgba(245,158,11,0.3)',
      } : {}}
      whileTap={!loading ? { scale: 0.98, y: 0 } : {}}
      transition={{ duration: 0.2 }}
      className="w-full flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold py-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing Payment…
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Proceed to Payment
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}