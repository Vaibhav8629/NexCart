import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Clock, CheckCircle2, Truck, X, ChevronRight, Loader2, ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',  icon: Clock },
  packed:           { label: 'Packed',            color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',        icon: Package },
  shipped:          { label: 'Shipped',           color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',     icon: Truck },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-violet-500/15 text-violet-400 border-violet-500/30', icon: Truck },
  delivered:        { label: 'Delivered',         color: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-500/15 text-red-400 border-red-500/30',        icon: X },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden animate-pulse">
      <div className="h-16 bg-muted/30" />
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-muted/40" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted/40 rounded w-2/3" />
            <div className="h-3 bg-muted/30 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, fetchMyOrders, cancelOrder, loading } = useOrder();
  const { isAuthenticated } = useAuth();
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated, fetchMyOrders]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <Package className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Please login</h2>
        <p className="text-muted-foreground mb-8 text-center">Login to view your order history.</p>
        <Button size="lg" asChild className="rounded-full">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-screen-lg">
        <div className="h-10 bg-muted/30 rounded w-48 mb-10 animate-pulse" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-primary/10 p-6 rounded-full mb-6 inline-flex">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">No orders yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            When you place an order, it will appear here. Explore our premium collection.
          </p>
          <Button size="lg" asChild className="rounded-full">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-lg">
      <h1 className="text-4xl font-bold mb-10 text-foreground">Order History</h1>

      <AnimatePresence>
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.07 }}
            >
              <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur hover:border-border/70 transition-colors">
                {/* Header */}
                <div className="bg-muted/20 px-5 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-border/40">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Order ID</p>
                      <p className="font-mono text-xs font-semibold text-foreground mt-0.5 break-all">
                        {order._id.slice(-10).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Date</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <CardContent className="p-5">
                  {/* Product images strip */}
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="relative">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl border border-border/30 bg-muted/20"
                        />
                        {item.quantity > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-16 h-16 rounded-xl border border-border/30 bg-muted/20 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium">+{order.items.length - 4}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
                    {order.items.map((i) => i.name).slice(0, 2).join(', ')}
                    {order.items.length > 2 && ' & more'}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="rounded-lg border-border/50 hover:border-primary/50" asChild>
                      <Link to={`/orders/${order._id}`}>
                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                        disabled={cancellingId === order._id}
                        onClick={() => handleCancel(order._id)}
                      >
                        {cancellingId === order._id ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Cancelling...</>
                        ) : (
                          <><X className="mr-1 h-3 w-3" />Cancel Order</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
