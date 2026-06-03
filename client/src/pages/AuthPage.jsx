import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, registerUser } from '../lib/authApi';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const initialState = {
  name: '',
  email: '',
  password: '',
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
        : await registerUser(formData);

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

          {status.message && (
            <p className={`auth-status ${status.type}`}>{status.message}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

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