import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const WISHLIST_STORAGE_PREFIX = 'nexcart_wishlist';

const getUserKey = (user) => user?._id || user?.id || user?.email || null;

const getWishlistStorageKey = (user) => {
  const userKey = getUserKey(user);
  return userKey ? `${WISHLIST_STORAGE_PREFIX}_${userKey}` : null;
};

const readStoredWishlist = (storageKey) => {
  if (!storageKey) return [];

  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { user, loading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const activeStorageKeyRef = useRef(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    const nextStorageKey = getWishlistStorageKey(user);
    const previousStorageKey = activeStorageKeyRef.current;

    if (previousStorageKey && previousStorageKey !== nextStorageKey) {
      localStorage.removeItem(previousStorageKey);
    }

    if (!nextStorageKey) {
      activeStorageKeyRef.current = null;
      setWishlistItems([]);
      return;
    }

    activeStorageKeyRef.current = nextStorageKey;
    setWishlistItems(readStoredWishlist(nextStorageKey));
  }, [loading, user]);

  useEffect(() => {
    if (!activeStorageKeyRef.current) {
      return;
    }

    localStorage.setItem(activeStorageKeyRef.current, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    const exists = wishlistItems.find((item) => item._id === product._id);
    if (exists) {
      toast.error('Item already in wishlist');
      return;
    }
    setWishlistItems((prev) => [...prev, product]);
    toast.success('Added to wishlist');
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Removed from wishlist');
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.find((item) => item._id === product._id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item._id !== product._id));
      toast.success('Removed from wishlist');
    } else {
      setWishlistItems((prev) => [...prev, product]);
      toast.success('Added to wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success('Wishlist cleared');
  };

  const wishlistCount = wishlistItems.length;

  const value = {
    wishlist: wishlistItems,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
