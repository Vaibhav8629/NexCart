import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, MapPin, User, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

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
  { name: 'fullName', label: 'Full Name', placeholder: 'John Doe', icon: User, type: 'text', required: true },
  { name: 'email', label: 'Email Address', placeholder: 'john@example.com', icon: Mail, type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', icon: Phone, type: 'tel', required: true },
  { name: 'addressLine', label: 'Address Line', placeholder: '123, Luxury Apartments, Park Street', icon: MapPin, type: 'text', required: true },
];

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { placeOrder, loading } = useOrder();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    fullName: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});

  const shipping = cartTotal > 0 ? 15 : 0;
  const tax = cartTotal * 0.08;
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

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;
    if (!validate()) return;

    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
      },
      subtotal: cartTotal,
      shippingCost: shipping,
      tax,
      totalAmount: total,
    };

    try {
      const order = await placeOrder(payload);
      clearCart();
      navigate('/order-success', { state: { order } });
    } catch {
      // error already toasted in context
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
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
          <Link to="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-10 text-foreground">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* ── LEFT: Customer Information ── */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Customer Information</h2>
              </div>

              <div className="grid gap-4">
                {FIELD_CONFIG.map(({ name, label, placeholder, icon: Icon, type }) => (
                  <div key={name} className="grid gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        name={name}
                        type={type}
                        value={form[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary text-foreground"
                      />
                    </div>
                    {errors[name] && (
                      <p className="text-xs text-red-400">{errors[name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'city', label: 'City', placeholder: 'Mumbai' },
                    { name: 'state', label: 'State', placeholder: 'Maharashtra' },
                    { name: 'pincode', label: 'Pincode', placeholder: '400001' },
                    { name: 'country', label: 'Country', placeholder: 'India' },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name} className="grid gap-1.5">
                      <label className="text-sm font-medium text-muted-foreground">{label}</label>
                      <Input
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="bg-background/50 border-border/50 focus:border-primary text-foreground"
                      />
                      {errors[name] && (
                        <p className="text-xs text-red-400">{errors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24 bg-card/90 backdrop-blur-xl border-border/50 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg border border-border/30"
                      />
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

              {/* Totals */}
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

              <Button
                size="lg"
                className="w-full text-base font-bold rounded-xl py-6 bg-primary hover:bg-[#FFB833] text-black shadow-lg hover:shadow-primary/25 transition-all"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>

              <div className="mt-4 text-center">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
