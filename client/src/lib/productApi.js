import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

export const fetchProductsRequest = async () => {
  try {
    const { data } = await apiClient.get('/products');
    return data.products || [];
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const fetchProductRequest = async (productId) => {
  try {
    const { data } = await apiClient.get(`/products/${productId}`);
    return data.product;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const createProductRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/products', payload);
    return data.product;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const updateProductRequest = async (productId, payload) => {
  try {
    const { data } = await apiClient.put(`/products/${productId}`, payload);
    return data.product;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const deleteProductRequest = async (productId) => {
  try {
    const { data } = await apiClient.delete(`/products/${productId}`);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};