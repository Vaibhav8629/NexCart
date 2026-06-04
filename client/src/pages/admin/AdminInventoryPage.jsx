import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, AlertTriangle, XCircle, CheckCircle2, Pencil, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { fetchInventoryStatsRequest } from '../../lib/productApi';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const FILTERS = [
  { key: 'all',       label: 'All Products' },
  { key: 'low',       label: 'Low Stock' },
  { key: 'out',       label: 'Out of Stock' },
  { key: 'in',        label: 'In Stock' },
];

function getStockStatus(stock) {
  const n = Number(stock);
  if (n <= 0)  return { label: 'Out of Stock', variant: 'destructive', key: 'out' };
  if (n <= 5)  return { label: 'Low Stock',    variant: 'warning',     key: 'low' };
  return        { label: 'In Stock',       variant: 'success',     key: 'in'  };
}

function StatCard({ label, value, icon: Icon, color, bg, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="glass-card">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-white mt-0.5">{value ?? '—'}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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

export default function AdminInventoryPage() {
  const navigate = useNavigate();
  const { products, fetchProducts, loading } = useProducts();

  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchInventoryStatsRequest()
      .then(setStats)
      .catch(() => {});
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const status = getStockStatus(p.stock);
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && status.key === 'low') ||
      (filter === 'out' && status.key === 'out') ||
      (filter === 'in'  && status.key === 'in');
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const statCards = [
    { label: 'Total Products',    value: stats?.total,      icon: Boxes,        color: 'text-sky-300',    bg: 'bg-sky-400/15',    delay: 0 },
    { label: 'In Stock',          value: stats?.inStock,    icon: CheckCircle2, color: 'text-green-300',  bg: 'bg-green-400/15',  delay: 0.06 },
    { label: 'Low Stock',         value: stats?.lowStock,   icon: AlertTriangle,color: 'text-amber-300',  bg: 'bg-amber-400/15',  delay: 0.12 },
    { label: 'Out of Stock',      value: stats?.outOfStock, icon: XCircle,      color: 'text-red-300',    bg: 'bg-red-400/15',    delay: 0.18 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-300">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Stock Management</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Inventory</h1>
          </div>
          <span className="ml-auto text-2xl font-bold text-white">{products.length}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, category or brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {f.label}
              {f.key !== 'all' && stats && (
                <span className="ml-1.5 opacity-70">
                  ({f.key === 'low' ? stats.lowStock : f.key === 'out' ? stats.outOfStock : stats.inStock})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {loading && products.length === 0 ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Boxes className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No products found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || filter !== 'all' ? 'Try adjusting your filters.' : 'Add products to see inventory.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                      <TableHead className="px-6 py-4">Product</TableHead>
                      <TableHead className="px-4 py-4">Category</TableHead>
                      <TableHead className="px-4 py-4">Price</TableHead>
                      <TableHead className="px-4 py-4 text-center">Stock</TableHead>
                      <TableHead className="px-4 py-4">Status</TableHead>
                      <TableHead className="px-4 py-4">Action</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((product, idx) => {
                      const status = getStockStatus(product.stock);
                      return (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                                alt={product.name}
                                className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                                {product.brand && <p className="text-slate-500 text-xs">{product.brand}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-400 text-sm">{product.category}</TableCell>
                          <TableCell className="px-4 py-4 text-amber-400 text-sm font-semibold">
                            {formatCurrency(product.discountPrice || product.price)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-center">
                            <span className={`text-lg font-bold ${
                              Number(product.stock) === 0 ? 'text-red-400' :
                              Number(product.stock) <= 5 ? 'text-amber-400' :
                              'text-green-400'
                            }`}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 rounded-lg text-xs h-7 px-2"
                              onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit Stock
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((product, idx) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 flex items-center gap-3"
                    >
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                        <p className="text-slate-500 text-xs">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                          <span className={`text-xs font-bold ${
                            Number(product.stock) === 0 ? 'text-red-400' :
                            Number(product.stock) <= 5 ? 'text-amber-400' : 'text-green-400'
                          }`}>
                            {product.stock} units
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 rounded-lg text-xs h-7 px-2 flex-shrink-0"
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
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
