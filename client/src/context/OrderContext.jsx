import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart_orders');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nexcart_orders', JSON.stringify(orders));
  }, [orders]);

  const placeOrder = (cartItems, totalAmount) => {
    const newOrder = {
      _id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      items: cartItems,
      totalAmount,
      status: 'Processing',
    };
    
    setOrders(prev => [newOrder, ...prev]);
    toast.success('Order Placed Successfully');
    return newOrder;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within a OrderProvider');
  return context;
};
