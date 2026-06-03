import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Calendar, CreditCard, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const estimatedDelivery = order.estimatedDelivery
    ? formatDate(order.estimatedDelivery)
    : formatDate(new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000));

  return (
    <div className="container mx-auto px-4 py-16 max-w-screen-md">
      {/* ── Success Animation ── */}
      <div className="flex flex-col items-center text-center mb-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
          <div className="relative p-6 rounded-full bg-green-500/15 border border-green-500/30">
            <CheckCircle2 className="h-20 w-20 text-green-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
            Order Placed <span className="text-primary">Successfully!</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Thank you for your purchase. We're preparing your order and will ship it shortly.
          </p>
        </motion.div>
      </div>

      {/* ── Order Details Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card/90 backdrop-blur border-border/50 shadow-[0_0_50px_rgba(245,158,11,0.07)] mb-6">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-5 border-b border-border/40 pb-4">
              Order Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-foreground break-all">{order._id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Order Date</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Amount Paid</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Estimated Delivery</p>
                  <p className="text-sm font-semibold text-green-400">{estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Items preview ── */}
        {order.items && order.items.length > 0 && (
          <Card className="bg-card/80 backdrop-blur border-border/50 mb-8">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-border/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1 rounded-xl font-bold bg-primary hover:bg-[#FFB833] text-black"
            asChild
          >
            <Link to="/orders">View My Orders</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-xl font-bold border-border/50 hover:border-primary/50"
            asChild
          >
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
