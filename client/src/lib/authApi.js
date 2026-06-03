import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

export const registerUser = async (formData) => {
  try {
    const { data } = await apiClient.post('/auth/register', formData);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const loginUser = async (formData) => {
  try {
    const { data } = await apiClient.post('/auth/login', formData);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const getProfile = async () => {
  try {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};