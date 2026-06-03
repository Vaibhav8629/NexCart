import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle2,
  Truck, X, Loader2, User, Phone, Mail, Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoice } from '../lib/invoiceGenerator';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const TIMELINE_STEPS = [
  { key: 'pending',          label: 'Order Placed',       icon: Package },
  { key: 'packed',           label: 'Packed',             icon: Package },
  { key: 'shipped',          label: 'Shipped',            icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: Truck },
  { key: 'delivered',        label: 'Delivered',          icon: CheckCircle2 },
];

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'text-amber-400' },
  packed:           { label: 'Packed',            color: 'text-sky-400' },
  shipped:          { label: 'Shipped',           color: 'text-blue-400' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'text-violet-400' },
  delivered:        { label: 'Delivered',         color: 'text-green-400' },
  cancelled:        { label: 'Cancelled',         color: 'text-red-400' },
  payment_failed:   { label: 'Payment Failed',    color: 'text-red-400' },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-6 animate-pulse space-y-4">
      <div className="h-5 bg-muted/40 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-muted/30 rounded w-full" />
        <div className="h-3 bg-muted/30 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, cancelOrder, loading } = useOrder();
  const { isAuthenticated } = useAuth();
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderById(id);
    }
  }, [id, isAuthenticated, fetchOrderById]);

  const handleCancel = async () => {
    setCancellingOrder(true);
    try {
      await cancelOrder(id);
    } finally {
      setCancellingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Please login to view order details.</p>
        <Button asChild><Link to="/login">Login</Link></Button>
      </div>
    );
  }

  if (loading && !currentOrder) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-screen-lg space-y-6">
        <div className="h-8 bg-muted/30 rounded w-32 animate-pulse" />
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const order = currentOrder?._id === id ? currentOrder : null;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-6 inline-flex">
          <Package className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Order not found</h2>
        <Button asChild><Link to="/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isPaymentFailed = order.status === 'payment_failed';
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  // Timeline: find active step index
  const activeStepIdx = (isCancelled || isPaymentFailed) ? -1 :
    TIMELINE_STEPS.map((s) => s.key).lastIndexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-10 max-w-screen-lg">
      {/* Back */}
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary mb-6" asChild>
        <Link to="/orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">#{order._id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => generateInvoice(order)}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Download Invoice
          </Button>
          <span className={`text-base font-semibold ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10"
              disabled={cancellingOrder}
              onClick={handleCancel}
            >
              {cancellingOrder ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Cancelling...</>
              ) : (
                <><X className="mr-1 h-3 w-3" />Cancel Order</>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Order Timeline
                </h2>

                {isCancelled ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Order Cancelled</p>
                      {order.timeline?.find((t) => t.status === 'cancelled') && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(order.timeline.find((t) => t.status === 'cancelled').timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : isPaymentFailed ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Payment Failed</p>
                      {order.timeline?.find((t) => t.status === 'payment_failed') && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(order.timeline.find((t) => t.status === 'payment_failed').timestamp)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.timeline?.find((t) => t.status === 'payment_failed')?.note}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isDone = idx <= activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      const timelineEntry = order.timeline?.find((t) => t.status === step.key);
                      return (
                        <div key={step.key} className="flex gap-4 mb-0">
                          <div className="flex flex-col items-center">
                            <div className={`
                              h-9 w-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${isDone
                                ? isCurrent
                                  ? 'bg-primary border-primary shadow-[0_0_16px_rgba(245,158,11,0.5)]'
                                  : 'bg-primary/20 border-primary/60'
                                : 'bg-muted/30 border-border/40'}
                            `}>
                              <Icon className={`h-4 w-4 ${isDone ? 'text-primary' : 'text-muted-foreground'} ${isCurrent ? 'text-black' : ''}`} />
                            </div>
                            {idx < TIMELINE_STEPS.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[2rem] mt-1 mb-1 ${idx < activeStepIdx ? 'bg-primary/50' : 'bg-border/40'}`} />
                            )}
                          </div>
                          <div className={`pb-6 flex-1 ${idx === TIMELINE_STEPS.length - 1 ? 'pb-0' : ''}`}>
                            <p className={`text-sm font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            {timelineEntry ? (
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(timelineEntry.timestamp)}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground/40 mt-0.5">Pending</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Ordered */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Products Ordered
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-border/30 bg-muted/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary flex-shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          {/* Order Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground">{formatCurrency(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="text-foreground">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-base">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="pt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Payment</span>
                    <span className={
                      order.paymentStatus === 'paid' ? 'text-green-400' :
                      order.paymentStatus === 'failed' ? 'text-red-400' :
                      'text-amber-400'
                    }>
                      {order.paymentStatus === 'paid' ? 'Paid' :
                       order.paymentStatus === 'failed' ? 'Failed' :
                       'Pending'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Info
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-foreground">{order.shippingAddress?.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-foreground break-all">{order.shippingAddress?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-foreground">{order.shippingAddress?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Shipping Address
                </h2>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="text-foreground">{order.shippingAddress?.addressLine}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Estimated Delivery */}
          {!isCancelled && order.estimatedDelivery && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-xs uppercase tracking-widest text-primary/80 mb-1">Estimated Delivery</p>
                <p className="text-base font-bold text-primary">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
