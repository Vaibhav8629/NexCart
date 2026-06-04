import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getGoogleAuthUrl, loginUser, registerUser } from '../lib/authApi';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, setSession } = useAuth();
  const isLogin = mode === 'login';
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleGoogleSignIn = () => {
    window.location.assign(getGoogleAuthUrl());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = isLogin
        ? await loginUser({ email: formData.email, password: formData.password })
        : await registerUser({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          });

      if (payload?.token) {
        setSession(payload.token, payload.user);
      }

      setStatus({
        type: 'success',
        message: payload.message || (isLogin ? 'Login successful.' : 'Registration successful.'),
      });

      toast.success(payload.message || (isLogin ? 'Login successful.' : 'Registration successful.'));
      navigate(payload?.user?.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong.',
      });
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <span className="auth-kicker">NexCart</span>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p>
            {isLogin
              ? 'Sign in to continue managing your store and orders.'
              : 'Register once, then use the same backend session flow across the app.'}
          </p>
        </div>

        <Card className="auth-panel">
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign in' : 'Register'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Use your email and password to continue.' : 'Create your store account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <label>
                  Full name
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              {!isLogin && (
                <label>
                  Role
                  <Select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </label>
              )}

              <label>
                Email address
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </label>

              {status.message && <p className={`auth-status ${status.type}`}>{status.message}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center gap-3"
              disabled={isSubmitting}
            >
              <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5 shrink-0">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.652 33.657 29.239 37 24 37c-7.732 0-14-6.268-14-14s6.268-14 14-14c3.568 0 6.805 1.348 9.289 3.551l5.657-5.657C35.462 3.053 30.021 1 24 1 11.85 1 2 10.85 2 23s9.85 22 22 22 22-9.85 22-22c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.568 0 6.805 1.348 9.289 3.551l5.657-5.657C35.462 3.053 30.021 1 24 1 16.318 1 9.656 5.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 45c5.93 0 11.252-2.27 15.303-5.965l-7.06-5.963C29.977 35.693 27.071 37 24 37c-5.217 0-9.61-3.317-11.299-7.946l-6.53 5.03C9.488 39.685 16.227 45 24 45z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.245 3.505-4.155 6.29-7.06 7.972h.001l7.06 5.963C35.807 39.99 46 32 46 23c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Continue with Google
            </Button>

            <p className="auth-switch">
              {isLogin ? 'No account yet?' : 'Already have an account?'}{' '}
              <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Register' : 'Log in'}</Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}