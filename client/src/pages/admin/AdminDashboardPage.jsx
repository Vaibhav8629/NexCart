import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, ShoppingBag, TrendingUp, Ticket } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useProducts } from '../../context/ProductContext';
import { useOrder } from '../../context/OrderContext';
import { getAdminCouponsRequest } from '../../lib/couponApi';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export default function AdminDashboardPage() {
  const { products, fetchProducts } = useProducts();
  const { fetchOrderStats, orderStats } = useOrder();
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    fetchOrderStats();
    getAdminCouponsRequest().then(setCoupons).catch(() => setCoupons([]));
  }, [fetchProducts, fetchOrderStats, products.length]);

  const activeCoupons = coupons.filter((coupon) => coupon.isActive && new Date(coupon.expiryDate).getTime() >= Date.now());

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-sky-300',
      bg: 'bg-sky-400/15',
    },
    {
      label: 'Total Orders',
      value: orderStats?.totalOrders ?? '—',
      icon: ShoppingBag,
      color: 'text-amber-300',
      bg: 'bg-amber-400/15',
    },
    {
      label: 'Total Revenue',
      value: orderStats?.totalRevenue != null ? formatCurrency(orderStats.totalRevenue) : '—',
      icon: TrendingUp,
      color: 'text-green-300',
      bg: 'bg-green-400/15',
    },
    {
      label: 'Active Coupons',
      value: activeCoupons.length,
      icon: Ticket,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/15',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Overview</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order status breakdown */}
      {orderStats?.statusCounts && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Orders by Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(orderStats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex flex-col">
                  <p className="text-xs text-slate-500 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-white mt-0.5">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Coupon details</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Latest coupons</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/coupons">Manage Coupons</Link>
            </Button>
          </div>

          {coupons.length === 0 ? (
            <div className="px-6 pb-6 text-slate-400">No coupons available yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Minimum Order Amount</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Status</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {coupons.slice(0, 5).map((coupon) => {
                  const expired = new Date(coupon.expiryDate).getTime() < Date.now();
                  const limitReached = Number(coupon.usageLimit) > 0 && Number(coupon.usedCount) >= Number(coupon.usageLimit);

                  return (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-medium text-white">{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </TableCell>
                      <TableCell>{formatCurrency(coupon.minimumOrderAmount)}</TableCell>
                      <TableCell>{new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        {coupon.usedCount}
                        {Number(coupon.usageLimit) > 0 ? ` / ${coupon.usageLimit}` : ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant={!coupon.isActive ? 'destructive' : expired || limitReached ? 'warning' : 'success'}>
                          {!coupon.isActive ? 'Inactive' : expired ? 'Expired' : limitReached ? 'Limit Reached' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
