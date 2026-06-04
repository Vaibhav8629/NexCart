import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

export const getAdminCouponsRequest = async () => {
  try {
    const { data } = await apiClient.get('/coupons/admin');
    return data.coupons || [];
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const createCouponRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/coupons/admin', payload);
    return data.coupon;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const updateCouponRequest = async (couponId, payload) => {
  try {
    const { data } = await apiClient.put(`/coupons/admin/${couponId}`, payload);
    return data.coupon;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const deleteCouponRequest = async (couponId) => {
  try {
    const { data } = await apiClient.delete(`/coupons/admin/${couponId}`);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const validateCouponRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/coupons/validate', payload);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const removeCouponRequest = async (payload = {}) => {
  try {
    const { data } = await apiClient.post('/coupons/remove', payload);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};