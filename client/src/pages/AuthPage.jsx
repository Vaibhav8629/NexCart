import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getGoogleAuthUrl, loginUser, registerUser } from '../lib/authApi';
import { useAuth } from '../context/AuthContext';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

/* ─── Floating orb ─────────────────────────────────────────── */
function Orb({ style }) {
  return <div className="orb" style={style} aria-hidden="true" />;
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className="feat-card" style={{ animationDelay: `${delay}ms` }}>
      <span className="feat-icon">{icon}</span>
      <div>
        <p className="feat-title">{title}</p>
        <p className="feat-desc">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Stat pill ─────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div className="stat-pill">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─── Google SVG ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" width="18" height="18" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.652 33.657 29.239 37 24 37c-7.732 0-14-6.268-14-14s6.268-14 14-14c3.568 0 6.805 1.348 9.289 3.551l5.657-5.657C35.462 3.053 30.021 1 24 1 11.85 1 2 10.85 2 23s9.85 22 22 22 22-9.85 22-22c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.568 0 6.805 1.348 9.289 3.551l5.657-5.657C35.462 3.053 30.021 1 24 1 16.318 1 9.656 5.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 45c5.93 0 11.252-2.27 15.303-5.965l-7.06-5.963C29.977 35.693 27.071 37 24 37c-5.217 0-9.61-3.317-11.299-7.946l-6.53 5.03C9.488 39.685 16.227 45 24 45z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.245 3.505-4.155 6.29-7.06 7.972h.001l7.06 5.963C35.807 39.99 46 32 46 23c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, setSession } = useAuth();
  const isLogin = mode === 'login';
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleGoogleSignIn = () => window.location.assign(getGoogleAuthUrl());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const payload = isLogin
        ? await loginUser({ email: formData.email, password: formData.password })
        : await registerUser({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });

      if (payload?.token) setSession(payload.token, payload.user);
      setStatus({ type: 'success', message: payload.message || (isLogin ? 'Login successful.' : 'Registration successful.') });
      toast.success(payload.message || (isLogin ? 'Login successful.' : 'Registration successful.'));
      navigate(payload?.user?.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' });
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast Shopping', desc: 'Optimized experience with instant navigation and checkout.', delay: 200 },
    { icon: '📦', title: 'Smart Order Management', desc: 'Track, manage and monitor orders effortlessly.', delay: 350 },
    { icon: '🔒', title: 'Secure Authentication', desc: 'Enterprise-grade security with Google and Email login.', delay: 500 },
    { icon: '⌚', title: 'Fast Delivery', desc: 'Home Delivery withing 24 hours of order.', delay: 650 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #D4AF37;
          --gold-light: #F0CC5A;
          --gold-dim: rgba(212,175,55,0.18);
          --gold-glow: rgba(212,175,55,0.35);
          --black: #0A0A0A;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(212,175,55,0.22);
          --text: #F5F0E8;
          --muted: rgba(245,240,232,0.5);
          --error: #FF6B6B;
          --success: #6BCB77;
        }

        html, body { height: 100%; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #0D0D0D 100%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          overflow: hidden;
          position: relative;
        }

        /* ── Noise grain overlay ── */
        .auth-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        /* ── Floating orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -30px) scale(1.08); }
        }

        /* ══════════ LEFT PANEL ══════════ */
        .brand-panel {
          width: 55%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          overflow: hidden;
          z-index: 1;
        }

        .brand-panel::after {
          content: '';
          position: absolute;
          right: 0;
          top: 10%;
          bottom: 10%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--gold-dim), var(--gold), var(--gold-dim), transparent);
        }

        /* Logo */
        .brand-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 80px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #D4AF37 0%, #F5E070 40%, #C9960C 70%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 6px;
          animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both;
          filter: drop-shadow(0 0 24px rgba(212,175,55,0.4));
        }

        .brand-tagline-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--gold-dim);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 32px;
          width: fit-content;
          animation: fadeUp 0.8s 0.1s cubic-bezier(.22,1,.36,1) both;
        }

        .brand-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.5vw, 46px);
          font-weight: 600;
          line-height: 1.2;
          color: var(--text);
          margin-bottom: 18px;
          animation: fadeUp 0.8s 0.15s cubic-bezier(.22,1,.36,1) both;
        }
        .brand-headline em {
          font-style: italic;
          color: var(--gold-light);
        }

        .brand-desc {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 420px;
          margin-bottom: 44px;
          font-weight: 300;
          animation: fadeUp 0.8s 0.2s cubic-bezier(.22,1,.36,1) both;
        }

        /* Feature grid */
        .feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 44px;
        }

        .feat-card {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 16px;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
          animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both;
          cursor: default;
        }
        .feat-card:hover {
          border-color: rgba(212,175,55,0.55);
          background: rgba(212,175,55,0.06);
          transform: translateY(-2px);
        }

        .feat-icon {
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .feat-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }

        .feat-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
          font-weight: 300;
        }

        /* Stats */
        .stats-row {
          display: flex;
          gap: 16px;
          animation: fadeUp 0.8s 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        .stat-pill {
          display: flex;
          flex-direction: column;
          gap: 3px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 20px;
          flex: 1;
          text-align: center;
        }

        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--gold-light);
          line-height: 1;
        }

        .stat-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--muted);
        }

        /* ══════════ RIGHT PANEL ══════════ */
        .auth-panel {
          width: 45%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 48px;
          position: relative;
          z-index: 1;
        }

        .glass-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 44px 40px;
          box-shadow:
            0 0 0 1px rgba(212,175,55,0.08) inset,
            0 32px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(212,175,55,0.06);
          animation: slideInRight 0.9s cubic-bezier(.22,1,.36,1) both;
        }

        .card-header {
          margin-bottom: 36px;
          text-align: center;
        }

        .card-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 12px;
          display: block;
        }

        .card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-size: 14px;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.5;
        }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 16px; }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(245,240,232,0.65);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 12px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: rgba(245,240,232,0.28); }
        .field-input:focus {
          border-color: var(--gold);
          background: rgba(212,175,55,0.05);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
        }
        .field-input option { background: #111; color: var(--text); }

        /* Status */
        .auth-status {
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 500;
        }
        .auth-status.error { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: var(--error); }
        .auth-status.success { background: rgba(107,203,119,0.1); border: 1px solid rgba(107,203,119,0.3); color: var(--success); }

        /* Primary button */
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #C9960C 0%, #D4AF37 45%, #F0CC5A 100%);
          border: none;
          border-radius: 12px;
          color: #0A0A0A;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          box-shadow: 0 4px 24px rgba(212,175,55,0.3);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .btn-primary:hover:not(:disabled)::before { transform: translateX(100%); }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212,175,55,0.45);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(212,175,55,0.22), transparent);
        }
        .divider-text {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.3);
          white-space: nowrap;
        }

        /* Google button */
        .btn-google {
          width: 100%;
          padding: 13px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }
        .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Switch link */
        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
        }
        .auth-switch a {
          color: var(--gold-light);
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .auth-switch a:hover { border-color: var(--gold-light); }

        /* ── Keyframes ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .auth-root { flex-direction: column; overflow-y: auto; }
          .brand-panel {
            width: 100%;
            padding: 48px 32px 40px;
          }
          .brand-panel::after { display: none; }
          .auth-panel {
            width: 100%;
            padding: 0 24px 60px;
          }
          .glass-card { max-width: 100%; }
          .feat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }

        @media (max-width: 540px) {
          .brand-panel { padding: 40px 20px 32px; }
          .feat-grid { grid-template-columns: 1fr; }
          .stats-row { gap: 10px; }
          .glass-card { padding: 32px 24px; }
          .card-title { font-size: 28px; }
        }
      `}</style>

      <div className="auth-root">
        {/* Ambient orbs */}
        <Orb style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', top: '-120px', left: '-100px', animationDuration: '14s' }} />
        <Orb style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', bottom: '-80px', left: '30%', animationDuration: '11s', animationDirection: 'alternate-reverse' }} />
        <Orb style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', top: '40%', right: '5%', animationDuration: '9s' }} />

        {/* ─── LEFT: Brand Panel ─── */}
        <section className="brand-panel">
          <div className="brand-logo">NexCart</div>
          <span className="brand-tagline-chip">✦ Premium E-Commerce Platform</span>
          <h1 className="brand-headline">
            The Future of<br /><em>Smart Shopping</em>
          </h1>
          <p className="brand-desc">
            NexCart is a modern e-commerce platform built for ambitious businesses — combining blazing performance, smart analytics, and enterprise security in a single elegant dashboard.
          </p>

          <div className="feat-grid">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          <div className="stats-row">
            <Stat value="10K+" label="Products" />
            <Stat value="5K+" label="Customers" />
            <Stat value="99.9%" label="Uptime" />
          </div>
        </section>

        {/* ─── RIGHT: Auth Panel ─── */}
        <section className="auth-panel">
          <div className="glass-card">
            <div className="card-header">
              <span className="card-eyebrow">NexCart</span>
              <h2 className="card-title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="card-subtitle">
                {isLogin
                  ? 'Sign in to continue your NexCart journey.'
                  : 'Join NexCart and start managing your business.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input
                    className="field-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              {!isLogin && (
                <div className="field-group">
                  <label className="field-label">Role</label>
                  <select
                    className="field-input"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </div>

              {status.message && (
                <p className={`auth-status ${status.type}`}>{status.message}</p>
              )}

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="divider" style={{ margin: '20px 0' }}>
              <span className="divider-line" />
              <span className="divider-text">or continue with</span>
              <span className="divider-line" />
            </div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="auth-switch" style={{ marginTop: '24px' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link to={isLogin ? '/register' : '/login'}>
                {isLogin ? 'Register' : 'Log in'}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}