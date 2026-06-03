import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

// ─── User ─────────────────────────────────────────────────────────────────────

export const placeOrderRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/orders', payload);
    return data.order;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const getMyOrdersRequest = async () => {
  try {
    const { data } = await apiClient.get('/orders/my-orders');
    return data.orders || [];
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const getOrderByIdRequest = async (orderId) => {
  try {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data.order;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const cancelOrderRequest = async (orderId) => {
  try {
    const { data } = await apiClient.patch(`/orders/${orderId}/cancel`);
    return data.order;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllOrdersRequest = async () => {
  try {
    const { data } = await apiClient.get('/orders/admin/all');
    return data.orders || [];
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const updateOrderStatusRequest = async (orderId, status) => {
  try {
    const { data } = await apiClient.patch(`/orders/admin/${orderId}/status`, { status });
    return data.order;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const getOrderStatsRequest = async () => {
  try {
    const { data } = await apiClient.get('/orders/admin/stats');
    return data.stats;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};
