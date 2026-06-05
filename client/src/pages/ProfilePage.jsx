import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Package, Heart, LogOut, Settings,
  Shield, ShoppingBag, Pencil, Lock, Loader2, Eye, EyeOff,
  Star, CheckCircle, ChevronRight, Home, TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { updateProfileRequest, changePasswordRequest } from '../lib/authApi';
import { Dialog, DialogContent } from '../components/ui/dialog';

// ── Animated Counter ────────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

// ── Floating Particles ──────────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(212,175,55,0.8), rgba(212,175,55,0.1))`,
            boxShadow: `0 0 ${p.size * 3}px rgba(212,175,55,0.6)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Password Strength Meter ─────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const score = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const tips = [
    { text: 'Use 8+ characters', met: password.length >= 8 },
    { text: 'Use uppercase letters', met: /[A-Z]/.test(password) },
    { text: 'Use numbers', met: /[0-9]/.test(password) },
    { text: 'Use symbols', met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs font-medium" style={{ color: colors[score] }}>
          {labels[score]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-1 mt-2">
        {tips.map((tip) => (
          <p key={tip.text} className="text-xs flex items-center gap-1"
            style={{ color: tip.met ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>
            <span>{tip.met ? '✓' : '○'}</span> {tip.text}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Edit Profile Dialog ─────────────────────────────────────────────────────────
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
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 24,
            boxShadow: '0 0 60px rgba(212,175,55,0.15), 0 0 120px rgba(0,0,0,0.8)',
            padding: 32,
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Pencil size={24} style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Edit Your Profile
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Keep your account information updated
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Your full name"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, outline: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)',
                  color: 'white', fontSize: 15, transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Email Address
              </label>
              <input
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, outline: 'none',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.3)', fontSize: 15, cursor: 'not-allowed',
                  boxSizing: 'border-box',
                }}
              />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Email cannot be changed.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F0C040)', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Password Dialog ──────────────────────────────────────────────────────
function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'At least 6 characters required.';
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

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12, outline: 'none',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)',
    color: 'white', fontSize: 15, transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 24,
            boxShadow: '0 0 60px rgba(212,175,55,0.15), 0 0 120px rgba(0,0,0,0.8)',
            padding: 32,
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}
              animate={{ boxShadow: ['0 0 10px rgba(212,175,55,0.2)', '0 0 30px rgba(212,175,55,0.4)', '0 0 10px rgba(212,175,55,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock size={24} style={{ color: '#D4AF37' }} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Update Password
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Keep your account secure
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Current Password</label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={handleChange('currentPassword')}
                  placeholder="Enter current password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword}</p>}
            </div>

            {/* New */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>New Password</label>
              <div className="relative">
                <input
                  type={show.new ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange('newPassword')}
                  placeholder="At least 6 characters"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, new: !p.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword}</p>}
              <PasswordStrength password={form.newPassword} />
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Repeat new password"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
              />
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F0C040)', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Changing…</> : 'Change Password'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// ── Nav Item ────────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick, danger }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 relative group"
      style={{
        background: active ? 'linear-gradient(135deg, #D4AF37, #C9A227)' : 'transparent',
        color: active ? '#000' : danger ? '#ef4444' : 'rgba(255,255,255,0.65)',
        border: active ? 'none' : '1px solid transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(212,175,55,0.08)';
          e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.2)';
          e.currentTarget.style.color = danger ? '#ef4444' : '#D4AF37';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = danger ? '#ef4444' : 'rgba(255,255,255,0.65)';
        }
      }}
    >
      <Icon size={17} />
      <span className="text-sm font-medium">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto" />}
    </motion.button>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      whileHover={{ y: -6, boxShadow: '0 0 40px rgba(212,175,55,0.25)' }}
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.4) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 20,
        padding: '24px 20px',
        cursor: 'default',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color: '#D4AF37' }} />
        </div>
        <TrendingUp size={14} style={{ color: 'rgba(212,175,55,0.5)', marginTop: 4 }} />
      </div>
      <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        <AnimatedCounter target={value} />
      </p>
      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
    </motion.div>
  );
}

// ── Info Tile ───────────────────────────────────────────────────────────────────
function InfoTile({ label, value, badge }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: 14,
        padding: '16px 18px',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
        e.currentTarget.style.background = 'rgba(212,175,55,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#D4AF37' }}>{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-white">{value}</p>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Security Tile ───────────────────────────────────────────────────────────────
function SecurityTile({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: 14,
        padding: '18px 20px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={16} style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>
          </div>
        </div>
        {actionLabel && (
          <motion.button
            onClick={onAction}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#D4AF37', cursor: 'pointer',
            }}
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ── Quick Action Button ─────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, primary, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm w-full"
      style={primary ? {
        background: 'linear-gradient(135deg, #D4AF37, #C9A227)',
        color: '#000', cursor: 'pointer', border: 'none',
        boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
      } : {
        background: 'transparent',
        border: '1px solid rgba(212,175,55,0.35)',
        color: '#D4AF37', cursor: 'pointer',
      }}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
}

// ── Section Card Wrapper ────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      style={{
        background: 'linear-gradient(135deg, rgba(18,18,18,0.95) 0%, rgba(10,10,10,0.98) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 24,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-8 py-6">{children}</div>
    </motion.div>
  );
}

// ── Main Profile Page ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { orders } = useOrder();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '—';

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const gold = '#D4AF37';
  const goldFaint = 'rgba(212,175,55,0.12)';

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>

        {/* ── Hero Banner ───────────────────────────────────────────────────── */}
        <div style={{
          minHeight: 300,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0d07 40%, #0a0a0a 100%)',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow blobs */}
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
            top: -150, left: -100, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
            bottom: -150, right: -100, pointerEvents: 'none',
          }} />

          <FloatingParticles />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>

              {/* Left — Avatar + Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  style={{ position: 'relative', flexShrink: 0 }}
                >
                  <motion.div
                    animate={{ boxShadow: ['0 0 20px rgba(212,175,55,0.3)', '0 0 50px rgba(212,175,55,0.6)', '0 0 20px rgba(212,175,55,0.3)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{
                      width: 96, height: 96, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, fontWeight: 700, color: '#000',
                      border: '3px solid rgba(212,175,55,0.8)',
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {initials}
                  </motion.div>
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2, width: 16, height: 16,
                    borderRadius: '50%', background: '#22c55e',
                    border: '2px solid #080808',
                  }} />
                </motion.div>

                {/* Name + Email + Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 18 }}
                >
                  <h1 style={{
                    fontSize: 28, fontWeight: 800, color: 'white',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    lineHeight: 1.2, marginBottom: 4,
                  }}>{user.name}</h1>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} style={{ color: gold }} /> {user.email}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                      border: '1px solid rgba(212,175,55,0.4)',
                      color: gold, fontSize: 11, fontWeight: 700, padding: '4px 12px',
                      borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      <Star size={10} fill={gold} /> {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500, padding: '4px 12px',
                      borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      Since {memberSince}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Right — Hero Stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: Package, label: 'Orders', value: orders.length },
                  { icon: ShoppingBag, label: 'Cart', value: cartItems.length },
                  { icon: Heart, label: 'Wishlist', value: wishlist?.length ?? 0 },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', damping: 16 }}
                    style={{
                      background: 'rgba(212,175,55,0.06)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 18, padding: '16px 24px',
                      textAlign: 'center', minWidth: 84,
                    }}
                  >
                    <s.icon size={18} style={{ color: gold, margin: '0 auto 8px' }} />
                    <p style={{
                      fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}>
                      <AnimatedCounter target={s.value} />
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      {s.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── Sidebar Nav ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 18 }}
            style={{
              width: 260, flexShrink: 0,
              background: 'linear-gradient(160deg, rgba(18,18,18,0.95), rgba(10,10,10,0.98))',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: 24, padding: '24px 16px',
              backdropFilter: 'blur(20px)',
              position: 'sticky', top: 96,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest px-4 mb-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}>Account</p>

            <NavItem icon={User} label="Personal Information" active={activeNav === 'profile'} onClick={() => setActiveNav('profile')} />
            <NavItem icon={Package} label="Order History" onClick={() => navigate('/orders')} />
            <NavItem icon={Pencil} label="Edit Profile" onClick={() => { setActiveNav('profile'); setEditOpen(true); }} />
            <NavItem icon={Lock} label="Change Password" onClick={() => setPwOpen(true)} />
            <NavItem icon={Heart} label="Wishlist" onClick={() => navigate('/wishlist')} />
            <NavItem icon={ShoppingBag} label="Cart" onClick={() => navigate('/cart')} />

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

            <NavItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
          </motion.div>

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <StatCard icon={Package} value={orders.length} label="Total Orders" delay={0.1} />
              <StatCard icon={Heart} value={wishlist?.length ?? 0} label="Wishlist Items" delay={0.15} />
              <StatCard icon={ShoppingBag} value={cartItems.length} label="Cart Items" delay={0.2} />
              <StatCard icon={Shield} value={1} label="Account Active" delay={0.25} />
            </div>

            {/* Personal Information */}
            <SectionCard
              title="Personal Information"
              subtitle="Manage your personal account details"
              icon={User}
              delay={0.3}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <InfoTile label="Full Name" value={user.name} />
                <InfoTile label="Email Address" value={user.email} badge="Verified" />
                <InfoTile label="Account Type" value={user.role === 'admin' ? 'Administrator' : 'Customer'} />
                <InfoTile label="Member Since" value={memberSince} />
              </div>
            </SectionCard>

            {/* Security Center */}
            <SectionCard
              title="Security Center"
              subtitle="Protect your account and data"
              icon={Shield}
              delay={0.35}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SecurityTile
                  icon={Lock}
                  title="Password"
                  subtitle="Password protected account"
                  actionLabel="Change"
                  onAction={() => setPwOpen(true)}
                />
                <SecurityTile
                  icon={CheckCircle}
                  title="Email Verified"
                  subtitle="Your email address is verified"
                />
                <SecurityTile
                  icon={Shield}
                  title="Account Protected"
                  subtitle="Secure login enabled"
                />
              </div>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard
              title="Quick Actions"
              subtitle="Common account tasks"
              icon={Settings}
              delay={0.4}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <QuickAction icon={Pencil} label="Edit Profile" primary onClick={() => setEditOpen(true)} />
                <QuickAction icon={Lock} label="Change Password" onClick={() => setPwOpen(true)} />
                <QuickAction icon={Package} label="View Orders" onClick={() => navigate('/orders')} />
                <QuickAction icon={Home} label="Continue Shopping" onClick={() => navigate('/')} />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={updateUser} />
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  );
}