import { useEffect } from 'react';
import { BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { useProducts } from '../../context/ProductContext';
import { useOrder } from '../../context/OrderContext';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export default function AdminDashboardPage() {
  const { products, fetchProducts } = useProducts();
  const { fetchOrderStats, orderStats } = useOrder();

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    fetchOrderStats();
  }, [fetchProducts, fetchOrderStats, products.length]);

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

      <div className="grid gap-5 md:grid-cols-3">
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
    </div>
  );
}
