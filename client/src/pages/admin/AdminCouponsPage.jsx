import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, Ticket, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  createCouponRequest,
  deleteCouponRequest,
  getAdminCouponsRequest,
  updateCouponRequest,
} from '../../lib/couponApi';

const EMPTY_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '0',
  expiryDate: '',
  isActive: true,
  usageLimit: '0',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const formatDateInput = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
};

const getStatusBadge = (coupon) => {
  const expired = new Date(coupon.expiryDate).getTime() < Date.now();
  const limitReached = Number(coupon.usageLimit) > 0 && Number(coupon.usedCount) >= Number(coupon.usageLimit);

  if (!coupon.isActive) {
    return <Badge variant="destructive">Inactive</Badge>;
  }

  if (expired || limitReached) {
    return <Badge variant="warning">Paused</Badge>;
  }

  return <Badge variant="success">Active</Badge>;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.isActive && new Date(coupon.expiryDate).getTime() >= Date.now()),
    [coupons]
  );

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const result = await getAdminCouponsRequest();
      setCoupons(result);
    } catch (error) {
      toast.error(error.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditDialog = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue ?? ''),
      minimumOrderAmount: String(coupon.minimumOrderAmount ?? 0),
      expiryDate: formatDateInput(coupon.expiryDate),
      isActive: Boolean(coupon.isActive),
      usageLimit: String(coupon.usageLimit ?? 0),
    });
    setFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
      expiryDate: form.expiryDate,
      isActive: form.isActive,
      usageLimit: Number(form.usageLimit) || 0,
    };

    if (!payload.code) {
      toast.error('Coupon code is required.');
      return;
    }

    try {
      setBusyId(editingCoupon?._id || 'create');
      if (editingCoupon) {
        await updateCouponRequest(editingCoupon._id, payload);
        toast.success('Coupon updated successfully.');
      } else {
        await createCouponRequest(payload);
        toast.success('Coupon created successfully.');
      }

      setFormOpen(false);
      setEditingCoupon(null);
      setForm(EMPTY_FORM);
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setBusyId(deleteTarget._id);
      await deleteCouponRequest(deleteTarget._id);
      toast.success('Coupon deleted successfully.');
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to delete coupon.');
    } finally {
      setDeleteTarget(null);
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      setBusyId(coupon._id);
      await updateCouponRequest(coupon._id, { isActive: !coupon.isActive });
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}.`);
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Promotions</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">Coupons</h1>
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Total Coupons</p>
            <p className="mt-1 text-3xl font-semibold text-white">{coupons.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Active Coupons</p>
            <p className="mt-1 text-3xl font-semibold text-white">{activeCoupons.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Expiring Soon</p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {coupons.filter((coupon) => {
                const expiry = new Date(coupon.expiryDate).getTime();
                const diffDays = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
                return diffDays <= 7 && diffDays >= 0;
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-slate-400">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No coupons have been created yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Minimum Order</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-medium text-white">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </TableCell>
                    <TableCell>{formatCurrency(coupon.minimumOrderAmount)}</TableCell>
                    <TableCell>{formatDate(coupon.expiryDate)}</TableCell>
                    <TableCell>
                      {coupon.usedCount}
                      {Number(coupon.usageLimit) > 0 ? ` / ${coupon.usageLimit}` : ''}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(coupon)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(coupon)} disabled={busyId === coupon._id}>
                          <RefreshCcw className="h-4 w-4" />
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(coupon)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
            <DialogDescription>
              Configure the discount, minimum order amount, expiry and usage controls.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Coupon Code</label>
              <Input name="code" value={form.code} onChange={handleChange} placeholder="SAVE10" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Discount Type</label>
              <Select name="discountType" value={form.discountType} onChange={handleChange}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Discount Value</label>
                <Input name="discountValue" type="number" min="0" step="0.01" value={form.discountValue} onChange={handleChange} placeholder="10" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Minimum Order Amount</label>
                <Input name="minimumOrderAmount" type="number" min="0" step="0.01" value={form.minimumOrderAmount} onChange={handleChange} placeholder="999" />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Expiry Date</label>
                <Input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Usage Limit</label>
                <Input name="usageLimit" type="number" min="0" step="1" value={form.usageLimit} onChange={handleChange} placeholder="0" />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Checkbox name="isActive" checked={form.isActive} onChange={handleChange} />
              <span className="text-sm text-slate-200">Active coupon</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busyId === 'create' || busyId === editingCoupon?._id}>
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete coupon"
        description={`Are you sure you want to delete ${deleteTarget?.code || 'this coupon'}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}