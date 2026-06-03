import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useProducts } from '../../context/ProductContext';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { products, fetchProducts, deleteProduct, loading } = useProducts();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteProduct(deleteTarget._id);
      toast.success('Product deleted successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to delete product.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Catalog management</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Products</h1>
        </div>
        <Button asChild>
          <Link to="/admin/products/add"><Plus className="h-4 w-4" />Add Product</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell><img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" /></TableCell>
                  <TableCell className="font-medium text-white">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.discountPrice || product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={Number(product.stock) > 5 ? 'success' : Number(product.stock) > 0 ? 'warning' : 'destructive'}>{product.stock}</Badge>
                  </TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => navigate(`/admin/products/edit/${product._id}`)}><Pencil className="h-4 w-4" />Edit</Button>
                      <Button variant="destructive" onClick={() => setDeleteTarget(product)}><Trash2 className="h-4 w-4" />Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <div className="p-6 text-slate-400">Loading products...</div>}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        description={`Are you sure you want to delete ${deleteTarget?.name || 'this product'}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}