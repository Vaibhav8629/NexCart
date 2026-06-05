import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile } from '../lib/authApi';

const AuthContext = createContext(null);
const CART_STORAGE_KEY = 'nexcart_cart';
const WISHLIST_STORAGE_KEY = 'nexcart_wishlist';

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

const clearLegacyCommerceCache = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
};

const getUserStorageKey = (prefix, activeUser) => {
  const userKey = activeUser?._id || activeUser?.id || activeUser?.email || null;
  return userKey ? `${prefix}_${userKey}` : null;
};

const clearUserScopedCommerceCache = (activeUser) => {
  const cartKey = getUserStorageKey(CART_STORAGE_KEY, activeUser);
  const wishlistKey = getUserStorageKey(WISHLIST_STORAGE_KEY, activeUser);

  if (cartKey) {
    localStorage.removeItem(cartKey);
  }

  if (wishlistKey) {
    localStorage.removeItem(wishlistKey);
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nexcart_token'));
  const [user, setUser] = useState(() => {
    const storedUser = parseStoredUser(localStorage.getItem('nexcart_user'));
    return localStorage.getItem('nexcart_token') ? storedUser : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('nexcart_token')));

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!token) {
        clearLegacyCommerceCache();
        clearUserScopedCommerceCache(user);
        localStorage.removeItem('nexcart_user');
        setUser(null);
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
          clearUserScopedCommerceCache(user);
          clearLegacyCommerceCache();
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
    clearLegacyCommerceCache();
    localStorage.setItem('nexcart_token', nextToken);
    localStorage.setItem('nexcart_user', JSON.stringify(nextUser));
  }, []);

  // Updates user data in state + localStorage without changing the token
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('nexcart_user', JSON.stringify(updatedUser));
  }, []);

  const logout = useCallback(() => {
    clearUserScopedCommerceCache(user);
    clearLegacyCommerceCache();
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
      updateUser,
      logout,
    }),
    [loading, logout, setSession, updateUser, token, user]
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