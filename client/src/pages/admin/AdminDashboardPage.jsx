import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { useProducts } from '../../context/ProductContext';

export default function AdminDashboardPage() {
  const { products, fetchProducts } = useProducts();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-300"><BarChart3 className="h-5 w-5" /></div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Overview</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-slate-400">Total Products</p><p className="mt-2 text-4xl font-semibold text-white">{products.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-slate-400">Total Orders</p><p className="mt-2 text-4xl font-semibold text-white">0</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-slate-400">Total Users</p><p className="mt-2 text-4xl font-semibold text-white">0</p></CardContent></Card>
      </div>
    </div>
  );
}