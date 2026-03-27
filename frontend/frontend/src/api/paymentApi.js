import axiosInstance from './axiosInstance.js';

export const paymentApi = {
  createOrder: (data) => axiosInstance.post('/api/v1/payments/create-order', data),
  verifyPayment: (data) => axiosInstance.post('/api/v1/payments/verify', data),
  getHistory: () => axiosInstance.get('/api/v1/payments/history'),
  getByOrder: (orderId) => axiosInstance.get(`/api/v1/payments/order/${orderId}`),
};
