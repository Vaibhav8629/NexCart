import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Lock, Loader2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { confirmPaymentRequest } from '../lib/paymentApi';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import toast from 'react-hot-toast';

// ── Initialise Stripe once outside component to avoid re-renders ──────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

// ── Stripe Appearance matching the black/gold design system ──────────────────
const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#F59E0B',
    colorBackground: '#18181B',
    colorText: '#ffffff',
    colorDanger: '#f87171',
    colorTextSecondary: '#A1A1AA',
    borderRadius: '12px',
    fontFamily: 'inherit',
  },
  rules: {
    '.Input': {
      backgroundColor: '#0A0A0A',
      border: '1px solid #27272A',
      color: '#ffffff',
    },
    '.Input:focus': {
      border: '1px solid #F59E0B',
      boxShadow: '0 0 0 1px #F59E0B',
    },
    '.Label': {
      color: '#A1A1AA',
      fontSize: '13px',
    },
    '.Tab': {
      backgroundColor: '#18181B',
      border: '1px solid #27272A',
    },
    '.Tab--selected': {
      border: '1px solid #F59E0B',
      color: '#F59E0B',
    },
    '.Block': {
      backgroundColor: '#18181B',
      border: '1px solid #27272A',
    },
  },
};

// ─── Inner Payment Form (must be inside <Elements>) ──────────────────────────
function CheckoutForm({ orderId, breakdown, onSuccess, onFailure }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage('');

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Stripe will redirect here after 3DS/bank auth — we handle success via confirmPayment return value instead
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required', // Only redirect for methods that require it (3DS etc.)
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        // Notify server so the order status is updated to payment_failed
        if (paymentIntent?.id) {
          confirmPaymentRequest(paymentIntent.id).catch(() => {});
        }
        onFailure(error.message);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify server-side and get the confirmed order
        const order = await confirmPaymentRequest(paymentIntent.id);
        onSuccess(order);
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      onFailure(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'upi'],
        }}
      />

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || processing}
        className="w-full py-6 text-base font-bold rounded-xl bg-primary hover:bg-[#FFB833] text-black shadow-lg hover:shadow-primary/25 transition-all"
      >
        {processing ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing Payment...</>
        ) : (
          <><Lock className="mr-2 h-5 w-5" />Pay {formatCurrency(breakdown?.totalAmount)}</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" />
        Payments are encrypted and secured by Stripe
      </p>
    </form>
  );
}

// ─── Main Payment Page ────────────────────────────────────────────────────────
export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const { clientSecret, paymentIntentId, orderId, breakdown, shippingAddress, coupon } =
    location.state || {};

  useEffect(() => {
    // Guard: if accessed directly without state, redirect back
    if (!clientSecret || !orderId) {
      navigate('/checkout', { replace: true });
    }
  }, [clientSecret, orderId, navigate]);

  const handleSuccess = useCallback(
    (order) => {
      clearCart();
      toast.success('Payment Successful!');
      navigate('/order-success', { state: { order } });
    },
    [clearCart, navigate]
  );

  const handleFailure = useCallback(
    (reason) => {
      navigate('/payment-failed', {
        state: { reason, orderId, totalAmount: breakdown?.totalAmount },
      });
    },
    [navigate, orderId, breakdown]
  );

  if (!clientSecret || !orderId) return null;

  const options = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-screen-lg">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary mb-6">
        <Link to="/checkout"><ArrowLeft className="h-4 w-4 mr-2" />Back to Shipping</Link>
      </Button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">✓</div>
          <span className="text-sm text-muted-foreground">Shipping</span>
        </div>
        <div className="flex-1 h-px bg-primary/30 mx-2" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-black text-xs font-bold">2</div>
          <span className="text-sm font-semibold text-primary">Payment</span>
        </div>
        <div className="flex-1 h-px bg-border/40 mx-2" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
          <span className="text-sm text-muted-foreground">Confirmation</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-foreground">Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* ── LEFT: Stripe Payment Form ── */}
        <div className="lg:col-span-3">
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Payment Details</h2>
              </div>

              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                  orderId={orderId}
                  breakdown={breakdown}
                  onSuccess={handleSuccess}
                  onFailure={handleFailure}
                />
              </Elements>
            </CardContent>
          </Card>

          {/* Shipping address recap */}
          {shippingAddress && (
            <Card className="bg-card/50 backdrop-blur border-border/30 mt-4">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Delivering to</p>
                <p className="text-sm text-foreground font-medium">{shippingAddress.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {shippingAddress.addressLine}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24 bg-card/90 backdrop-blur-xl border-border/50 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-5 text-foreground">Order Summary</h2>

              {breakdown && (
                <>
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground font-medium">{formatCurrency(breakdown.subtotal)}</span>
                    </div>
                    {breakdown.couponDiscount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Coupon {coupon?.code ? `(${coupon.code})` : ''}</span>
                        <span className="text-emerald-400 font-medium">-{formatCurrency(breakdown.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-foreground font-medium">{formatCurrency(breakdown.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (8%)</span>
                      <span className="text-foreground font-medium">{formatCurrency(breakdown.tax)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total</span>
                      <span className="text-3xl font-bold text-primary">{formatCurrency(breakdown.totalAmount)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 p-3 rounded-xl bg-green-500/8 border border-green-500/15 flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-400">Your payment is protected by 256-bit SSL encryption.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
