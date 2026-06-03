import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, Clock, Package, Truck, CheckCircle2, X,
  ChevronDown, Loader2, Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrder } from '../../context/OrderContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Link } from 'react-router-dom';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   icon: Clock },
  packed:           { label: 'Packed',            bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',         icon: Package },
  shipped:          { label: 'Shipped',           bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',      icon: Truck },
  out_for_delivery: { label: 'Out for Delivery',  bg: 'bg-violet-500/15 text-violet-400 border-violet-500/30', icon: Truck },
  delivered:        { label: 'Delivered',         bg: 'bg-green-500/15 text-green-400 border-green-500/30',   icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',         bg: 'bg-red-500/15 text-red-400 border-red-500/30',         icon: X },
};

const NEXT_ACTIONS = {
  pending:  [{ status: 'packed', label: 'Mark Packed' }, { status: 'cancelled', label: 'Cancel', danger: true }],
  packed:   [{ status: 'shipped', label: 'Mark Shipped' }, { status: 'cancelled', label: 'Cancel', danger: true }],
  shipped:  [{ status: 'out_for_delivery', label: 'Out for Delivery' }],
  out_for_delivery: [{ status: 'delivered', label: 'Mark Delivered' }],
  delivered:  [],
  cancelled:  [],
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const { adminOrders, fetchAllOrders, updateOrderStatus, loading } = useOrder();
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId + status);
    try {
      await updateOrderStatus(orderId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = adminOrders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = adminOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Management</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Orders</h1>
          </div>
          <span className="ml-auto text-2xl font-bold text-white">{adminOrders.length}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`glass-card rounded-2xl p-4 text-left transition-all hover:scale-105 ${filterStatus === key ? 'ring-1 ring-amber-400/50' : ''}`}
            >
              <Icon className={`h-4 w-4 mb-2 ${cfg.bg.split(' ')[1]}`} />
              <p className="text-xs text-slate-400 capitalize">{cfg.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{counts[key] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {loading && adminOrders.length === 0 ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No orders found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Orders will appear here once customers place them.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-4 font-medium">Order ID</th>
                      <th className="text-left px-4 py-4 font-medium">Customer</th>
                      <th className="text-left px-4 py-4 font-medium">Date</th>
                      <th className="text-left px-4 py-4 font-medium">Items</th>
                      <th className="text-left px-4 py-4 font-medium">Total</th>
                      <th className="text-left px-4 py-4 font-medium">Status</th>
                      <th className="text-left px-4 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, idx) => {
                      const actions = NEXT_ACTIONS[order.status] || [];
                      return (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/orders/${order._id}`}
                              className="font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              #{order._id.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-white text-sm">{order.user?.name || 'Unknown'}</p>
                            <p className="text-slate-500 text-xs">{order.user?.email}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                          <td className="px-4 py-4 font-semibold text-amber-400">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {actions.map((action) => {
                                const isUpdating = updatingId === order._id + action.status;
                                return (
                                  <Button
                                    key={action.status}
                                    size="sm"
                                    variant="outline"
                                    disabled={!!updatingId}
                                    onClick={() => handleStatusUpdate(order._id, action.status)}
                                    className={`text-xs h-7 px-2 rounded-lg ${
                                      action.danger
                                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                        : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                    }`}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      action.label
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((order, idx) => {
                  const actions = NEXT_ACTIONS[order.status] || [];
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/orders/${order._id}`} className="font-mono text-xs text-amber-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                          <p className="text-white text-sm font-medium mt-0.5">{order.user?.name}</p>
                          <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400 font-bold text-sm">{formatCurrency(order.totalAmount)}</p>
                          <div className="mt-1"><StatusBadge status={order.status} /></div>
                        </div>
                      </div>
                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => {
                            const isUpdating = updatingId === order._id + action.status;
                            return (
                              <Button
                                key={action.status}
                                size="sm"
                                variant="outline"
                                disabled={!!updatingId}
                                onClick={() => handleStatusUpdate(order._id, action.status)}
                                className={`text-xs h-7 rounded-lg ${
                                  action.danger
                                    ? 'border-red-500/30 text-red-400'
                                    : 'border-amber-500/30 text-amber-400'
                                }`}
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : action.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
