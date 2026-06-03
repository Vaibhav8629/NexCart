import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, MapPin, User, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentIntentRequest } from '../lib/paymentApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import toast from 'react-hot-toast';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

const FIELD_CONFIG = [
  { name: 'fullName',    label: 'Full Name',       placeholder: 'John Doe',               icon: User,   type: 'text'  },
  { name: 'email',       label: 'Email Address',   placeholder: 'john@example.com',        icon: Mail,   type: 'email' },
  { name: 'phone',       label: 'Phone Number',    placeholder: '+91 98765 43210',          icon: Phone,  type: 'tel'   },
  { name: 'addressLine', label: 'Address Line',    placeholder: '123, Park Street',         icon: MapPin, type: 'text'  },
];

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    fullName: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const shipping = cartTotal > 0 ? 15 : 0;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const total = cartTotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Valid email is required.';
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
      const shippingAddress = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
      };

      const payload = {
        items: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress,
        shippingCost: shipping,
      };

      const result = await createPaymentIntentRequest(payload);

      // Navigate to payment page with all needed state
      navigate('/payment', {
        state: {
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId,
          orderId: result.orderId,
          breakdown: result.breakdown,
          shippingAddress,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Failed to initialise payment.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Add products to your cart before checking out.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-screen-xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
          <Link to="/cart"><ArrowLeft className="h-4 w-4 mr-2" />Back to Cart</Link>
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-black text-xs font-bold">1</div>
          <span className="text-sm font-semibold text-primary">Shipping</span>
        </div>
        <div className="flex-1 h-px bg-border/40 mx-2" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-bold">2</div>
          <span className="text-sm text-muted-foreground">Payment</span>
        </div>
        <div className="flex-1 h-px bg-border/40 mx-2" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
          <span className="text-sm text-muted-foreground">Confirmation</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-10 text-foreground">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* ── LEFT ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer Info */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
                <h2 className="text-xl font-semibold text-foreground">Customer Information</h2>
              </div>
              <div className="grid gap-4">
                {FIELD_CONFIG.map(({ name, label, placeholder, icon: Icon, type }) => (
                  <div key={name} className="grid gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name={name} type={type} value={form[name]} onChange={handleChange}
                        placeholder={placeholder}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary text-foreground" />
                    </div>
                    {errors[name] && <p className="text-xs text-red-400">{errors[name]}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'city',    label: 'City',    placeholder: 'Mumbai' },
                  { name: 'state',   label: 'State',   placeholder: 'Maharashtra' },
                  { name: 'pincode', label: 'Pincode', placeholder: '400001' },
                  { name: 'country', label: 'Country', placeholder: 'India' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name} className="grid gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">{label}</label>
                    <Input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                      className="bg-background/50 border-border/50 focus:border-primary text-foreground" />
                    {errors[name] && <p className="text-xs text-red-400">{errors[name]}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24 bg-card/90 backdrop-blur-xl border-border/50 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <motion.div key={item._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-border/30" />
                      <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="text-foreground font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="text-foreground font-medium">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="border-t border-border/50 mt-4 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button size="lg"
                className="w-full text-base font-bold rounded-xl py-6 bg-primary hover:bg-[#FFB833] text-black shadow-lg transition-all"
                onClick={handleProceedToPayment} disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Preparing Payment...</>
                ) : (
                  <><CreditCard className="mr-2 h-5 w-5" />Proceed to Payment</>
                )}
              </Button>

              <div className="mt-4 text-center">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-muted-foreground"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                Secured by Stripe. Your payment info is encrypted.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
