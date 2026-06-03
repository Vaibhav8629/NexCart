import apiClient from './apiClient';

const parseApiError = (error) => error?.response?.data?.message || error.message || 'Request failed.';

// Create a Stripe PaymentIntent + pending order on the server
export const createPaymentIntentRequest = async (payload) => {
  try {
    const { data } = await apiClient.post('/payments/create-intent', payload);
    return data; // { clientSecret, paymentIntentId, orderId, breakdown }
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

// Confirm payment with our server after Stripe succeeds (fallback to webhook)
export const confirmPaymentRequest = async (paymentIntentId) => {
  try {
    const { data } = await apiClient.post('/payments/confirm', { paymentIntentId });
    return data.order;
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};

// Admin: get all payments
export const getAllPaymentsRequest = async () => {
  try {
    const { data } = await apiClient.get('/payments/admin/all');
    return data.payments || [];
  } catch (error) {
    throw new Error(parseApiError(error), { cause: error });
  }
};
