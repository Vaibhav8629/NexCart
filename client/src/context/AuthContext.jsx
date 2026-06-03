import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile } from '../lib/authApi';

const AuthContext = createContext(null);

const parseStoredUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => parseStoredUser(localStorage.getItem('nexcart_user')));
  const [token, setToken] = useState(() => localStorage.getItem('nexcart_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('nexcart_token')));

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (user) {
        setLoading(false);
        return;
      }

      try {
        const payload = await getProfile();

        if (!cancelled) {
          setUser(payload.user);
          localStorage.setItem('nexcart_user', JSON.stringify(payload.user));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('nexcart_token');
          localStorage.removeItem('nexcart_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('nexcart_token', nextToken);
    localStorage.setItem('nexcart_user', JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nexcart_token');
    localStorage.removeItem('nexcart_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      setSession,
      logout,
    }),
    [loading, logout, setSession, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};