import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  placeOrderRequest,
  getMyOrdersRequest,
  getOrderByIdRequest,
  cancelOrderRequest,
  getAllOrdersRequest,
  updateOrderStatusRequest,
  getOrderStatsRequest,
} from '../lib/orderApi';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── User Actions ─────────────────────────────────────────────────────────

  const placeOrder = useCallback(async (payload) => {
    setLoading(true);
    try {
      const order = await placeOrderRequest(payload);
      setOrders((prev) => [order, ...prev]);
      setCurrentOrder(order);
      toast.success('Order Placed Successfully');
      return order;
    } catch (error) {
      toast.error(error.message || 'Failed to place order.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyOrdersRequest();
      setOrders(result);
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (orderId) => {
    setLoading(true);
    try {
      const order = await getOrderByIdRequest(orderId);
      setCurrentOrder(order);
      return order;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      const updated = await cancelOrderRequest(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (currentOrder?._id === orderId) setCurrentOrder(updated);
      toast.success('Order Cancelled');
      return updated;
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order.');
      throw error;
    }
  }, [currentOrder]);

  // ─── Admin Actions ────────────────────────────────────────────────────────

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllOrdersRequest();
      setAdminOrders(result);
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const updated = await updateOrderStatusRequest(orderId, status);
      setAdminOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success('Order status updated');
      return updated;
    } catch (error) {
      toast.error(error.message || 'Failed to update status.');
      throw error;
    }
  }, []);

  const fetchOrderStats = useCallback(async () => {
    try {
      const stats = await getOrderStatsRequest();
      setOrderStats(stats);
      return stats;
    } catch (error) {
      // silently fail for stats
    }
  }, []);

  const value = useMemo(
    () => ({
      orders,
      currentOrder,
      adminOrders,
      orderStats,
      loading,
      placeOrder,
      fetchMyOrders,
      fetchOrderById,
      cancelOrder,
      fetchAllOrders,
      updateOrderStatus,
      fetchOrderStats,
    }),
    [
      orders, currentOrder, adminOrders, orderStats, loading,
      placeOrder, fetchMyOrders, fetchOrderById, cancelOrder,
      fetchAllOrders, updateOrderStatus, fetchOrderStats,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
