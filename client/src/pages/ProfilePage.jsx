import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Package, Heart, LogOut, Settings,
  Shield, ShoppingBag, Pencil, Lock, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { updateProfileRequest, changePasswordRequest } from '../lib/authApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

// ── Edit Profile Dialog ────────────────────────────────────────────────────────
function EditProfileDialog({ open, onClose, user, onSaved }) {
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      const data = await updateProfileRequest({ name: name.trim() });
      onSaved(data.user);
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Your full name"
              className="bg-background/50 border-border/50 focus:border-primary text-foreground"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted/30 border-border/30 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary hover:bg-amber-500 text-black font-semibold">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Password Dialog ─────────────────────────────────────────────────────
function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'New password must be at least 6 characters.';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changePasswordRequest({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Current */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                placeholder="Enter current password"
                className="pr-10 bg-background/50 border-border/50 focus:border-primary text-foreground"
              />
              <button type="button" onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword}</p>}
          </div>
          {/* New */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                placeholder="At least 6 characters"
                className="pr-10 bg-background/50 border-border/50 focus:border-primary text-foreground"
              />
              <button type="button" onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword}</p>}
          </div>
          {/* Confirm */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Repeat new password"
              className="bg-background/50 border-border/50 focus:border-primary text-foreground"
            />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary hover:bg-amber-500 text-black font-semibold">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing…</> : 'Change Password'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { orders } = useOrder();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { title: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Items in Cart', value: cartItems.length, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Wishlist Items', value: wishlist?.length ?? 0, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-xl">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar ── */}
        <div className="md:w-1/3 lg:w-1/4">
          <Card className="border-border/50 bg-card/80 backdrop-blur sticky top-24">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-border/50">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-2 ring-primary/30">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1 text-sm">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                <div className="mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {user.role === 'admin' ? 'Administrator' : 'Member'}
                </div>
              </div>

              <div className="py-4 flex flex-col gap-1">
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-3" /> Personal Information
                </Button>
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/orders')}>
                  <Package className="h-4 w-4 mr-3" /> Order History
                </Button>
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => setEditOpen(true)}>
                  <Settings className="h-4 w-4 mr-3" /> Edit Profile
                </Button>
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => setPwOpen(true)}>
                  <Lock className="h-4 w-4 mr-3" /> Change Password
                </Button>
                <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-3" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-3" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main ── */}
        <div className="md:w-2/3 lg:w-3/4 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">My Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your account settings and preferences.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-border/50 bg-card/80 backdrop-blur hover:border-border/70 transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.bg}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                        <h4 className="text-2xl font-bold text-foreground">{stat.value}</h4>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Personal Info Card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-foreground font-medium">
                    {user.name}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-foreground flex items-center justify-between">
                    <span className="truncate">{user.email}</span>
                    <Badge variant="success" className="ml-2 text-[10px] flex-shrink-0">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Type</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-foreground capitalize">
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-foreground">
                    {memberSince}
                  </div>
                </div>
              </div>

              {/* Security section */}
              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Password</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last changed: never shown for security</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5"
                    onClick={() => setPwOpen(true)}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSaved={updateUser}
      />
      <ChangePasswordDialog
        open={pwOpen}
        onClose={() => setPwOpen(false)}
      />
    </div>
  );
}
