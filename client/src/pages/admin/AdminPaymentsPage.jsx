import React, { useEffect, useState } from 'react';
import { CreditCard, Search, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPaymentsRequest } from '../../lib/paymentApi';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const PAYMENT_STATUS_CONFIG = {
  paid:    { label: 'Paid',    bg: 'bg-green-500/15 text-green-400 border-green-500/30',   icon: CheckCircle2 },
  pending: { label: 'Pending', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   icon: Clock },
  failed:  { label: 'Failed',  bg: 'bg-red-500/15 text-red-400 border-red-500/30',          icon: XCircle },
  refunded:{ label: 'Refunded',bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',          icon: TrendingUp },
};

function PaymentStatusBadge({ status }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
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
    <div className="space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllPaymentsRequest();
        setPayments(data);
      } catch {
        // silently fail — admin will see empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = payments.filter((p) => {
    const matchStatus = filterStatus === 'all' || p.paymentStatus === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p._id.toLowerCase().includes(q) ||
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.paymentIntentId?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const totalRevenue = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((acc, p) => acc + (p.amountPaid || p.totalAmount || 0), 0);
  const paidCount = payments.filter((p) => p.paymentStatus === 'paid').length;
  const pendingCount = payments.filter((p) => p.paymentStatus === 'pending').length;
  const failedCount = payments.filter((p) => p.paymentStatus === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-green-400/15 p-3 text-green-300">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-green-300">Finance</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Payments</h1>
          </div>
          <span className="ml-auto text-2xl font-bold text-white">{payments.length}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Paid</p>
            <p className="text-xl font-bold text-white">{paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-400">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Failed</p>
            <p className="text-xl font-bold text-red-400">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order ID, customer, or intent ID..."
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
          {Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CreditCard className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No payments found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || filterStatus !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Stripe payments will appear here once customers complete checkout.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-4 font-medium">Order / Intent</th>
                      <th className="text-left px-4 py-4 font-medium">Customer</th>
                      <th className="text-left px-4 py-4 font-medium">Amount</th>
                      <th className="text-left px-4 py-4 font-medium">Method</th>
                      <th className="text-left px-4 py-4 font-medium">Date</th>
                      <th className="text-left px-4 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment, idx) => (
                      <motion.tr
                        key={payment._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs text-amber-400">
                            #{payment._id.slice(-8).toUpperCase()}
                          </p>
                          {payment.paymentIntentId && (
                            <p className="font-mono text-[10px] text-slate-600 mt-0.5 truncate max-w-[140px]">
                              {payment.paymentIntentId}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-white text-sm font-medium">{payment.user?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs">{payment.user?.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-green-400 text-sm">{formatCurrency(payment.amountPaid || payment.totalAmount)}</p>
                          {payment.amountPaid > 0 && payment.amountPaid !== payment.totalAmount && (
                            <p className="text-xs text-slate-500">
                              of {formatCurrency(payment.totalAmount)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs capitalize">
                          {payment.paymentMethod || 'stripe'}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs">
                          {payment.transactionDate
                            ? formatDate(payment.transactionDate)
                            : formatDate(payment.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <PaymentStatusBadge status={payment.paymentStatus} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((payment, idx) => (
                  <motion.div
                    key={payment._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs text-amber-400">#{payment._id.slice(-8).toUpperCase()}</p>
                        <p className="text-white text-sm font-medium mt-0.5">{payment.user?.name}</p>
                        <p className="text-slate-500 text-xs">{payment.user?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{formatCurrency(payment.amountPaid || payment.totalAmount)}</p>
                        <div className="mt-1">
                          <PaymentStatusBadge status={payment.paymentStatus} />
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {payment.transactionDate ? formatDate(payment.transactionDate) : formatDate(payment.createdAt)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
