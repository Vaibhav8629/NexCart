import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchProductRequest } from '../lib/productApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nexcart_cart', JSON.stringify(cartItems));
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
        cartCount
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
