import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

/**
 * Returns the full Google OAuth initiation URL on the Render backend.
 *
 * VITE_API_URL is expected to be "https://nexcart-66az.onrender.com/api"
 * → result: "https://nexcart-66az.onrender.com/api/auth/google"
 *
 * This function intentionally reads the env var at call time (not module
 * load time) so Vite's static replacement is always applied correctly.
 */
export const getGoogleAuthUrl = () => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!base) {
    throw new Error('VITE_API_URL is not defined. Google sign-in cannot proceed.');
  }
  return `${base}/auth/google`;
};

export const registerUser = async (formData) => {
  try {
    const { data

     } = await apiClient.post('/auth/register', formData);
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

export const updateProfileRequest = async (payload) => {
  try {
    const { data } = await apiClient.put('/auth/profile', payload);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

export const changePasswordRequest = async (payload) => {
  try {
    const { data } = await apiClient.put('/auth/change-password', payload);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};