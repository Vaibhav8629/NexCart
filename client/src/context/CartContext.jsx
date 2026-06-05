import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchProductRequest } from '../lib/productApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_STORAGE_PREFIX = 'nexcart_cart';

const getUserKey = (user) => user?._id || user?.id || user?.email || null;

const getCartStorageKey = (user) => {
  const userKey = getUserKey(user);
  return userKey ? `${CART_STORAGE_PREFIX}_${userKey}` : null;
};

const readStoredCart = (storageKey) => {
  if (!storageKey) return [];

  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const activeStorageKeyRef = useRef(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    const nextStorageKey = getCartStorageKey(user);
    const previousStorageKey = activeStorageKeyRef.current;

    if (previousStorageKey && previousStorageKey !== nextStorageKey) {
      localStorage.removeItem(previousStorageKey);
    }

    if (!nextStorageKey) {
      activeStorageKeyRef.current = null;
      setCartItems([]);
      return;
    }

    activeStorageKeyRef.current = nextStorageKey;
    setCartItems(readStoredCart(nextStorageKey));
  }, [loading, user]);

  useEffect(() => {
    if (!activeStorageKeyRef.current) {
      return;
    }

    localStorage.setItem(activeStorageKeyRef.current, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    toast.success('Product Added To Cart');
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Validates all cart items against live stock from the server.
   * Returns { valid: true } or { valid: false, errors: string[] }
   * Also removes out-of-stock items and caps quantities to available stock.
   */
  const validateCartStock = async () => {
    const errors = [];
    const updatedItems = [];
    let changed = false;

    for (const item of cartItems) {
      try {
        const product = await fetchProductRequest(item._id);
        if (!product || product.stock === 0) {
          errors.push(`"${item.name}" is now out of stock and has been removed from your cart.`);
          changed = true;
          // Don't add to updatedItems — remove it
        } else if (item.quantity > product.stock) {
          errors.push(`"${item.name}" quantity reduced to ${product.stock} (available stock).`);
          updatedItems.push({ ...item, quantity: product.stock });
          changed = true;
        } else {
          updatedItems.push(item);
        }
      } catch {
        // If we can't fetch, leave the item as-is (network error)
        updatedItems.push(item);
      }
    }

    if (changed) {
      setCartItems(updatedItems);
    }

    return { valid: errors.length === 0, errors };
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.discountPrice || item.price) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        validateCartStock,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
