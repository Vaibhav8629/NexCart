
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const handledTokenKey = 'nexcart_google_oauth_handled_token';

const parseOAuthHash = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);

  return {
    token: hash.get('token') || query.get('token'),
    user: hash.get('user') || query.get('user'),
    error: hash.get('error') || query.get('error') || query.get('oauth'),
  };
};

const parseUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
};

export default function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [message] = useState('Completing Google sign-in...');

  useEffect(() => {
    const { token, user, error } = parseOAuthHash();
    const handledToken = sessionStorage.getItem(handledTokenKey);

    if (!token && !user && handledToken) {
      return;
    }

    if (token && handledToken === token) {
      return;
    }

    if (token && handledToken && handledToken !== token) {
      sessionStorage.removeItem(handledTokenKey);
    }

    if (error) {
      sessionStorage.setItem(handledTokenKey, 'error');
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    const parsedUser = parseUser(user);

    if (!token || !parsedUser) {
      sessionStorage.setItem(handledTokenKey, 'error');
      toast.error('Google sign-in could not be completed.');
      navigate('/login', { replace: true });
      return;
    }

    sessionStorage.setItem(handledTokenKey, token);
    window.history.replaceState({}, document.title, window.location.pathname);
    setSession(token, parsedUser);
    toast.success('Signed in with Google.');
    navigate(parsedUser.role === 'admin' ? '/admin' : '/', { replace: true });
  }, [navigate, setSession]);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <span className="auth-kicker">NexCart</span>
          <h1>Signing you in</h1>
          <p>{message}</p>
        </div>
      </section>
    </main>
  );
}