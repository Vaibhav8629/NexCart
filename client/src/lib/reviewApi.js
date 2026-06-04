import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

export const fetchProductReviewsRequest = async (productId, page = 1, limit = 5) => {
  try {
    const { data } = await apiClient.get(`/reviews/product/${productId}`, { params: { page, limit } });
    return data; // { reviews, pagination }
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const createReviewRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/reviews', payload);
    return data.review;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const updateReviewRequest = async (reviewId, payload) => {
  try {
    const { data } = await apiClient.put(`/reviews/${reviewId}`, payload);
    return data.review;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const deleteReviewRequest = async (reviewId) => {
  try {
    const { data } = await apiClient.delete(`/reviews/${reviewId}`);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const adminGetAllReviewsRequest = async (page = 1, limit = 20) => {
  try {
    const { data } = await apiClient.get('/reviews/admin/all', { params: { page, limit } });
    return data; // { reviews, pagination }
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const adminDeleteReviewRequest = async (reviewId) => {
  try {
    const { data } = await apiClient.delete(`/reviews/admin/${reviewId}`);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};
