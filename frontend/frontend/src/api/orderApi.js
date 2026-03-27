import axiosInstance from './axiosInstance.js';

export const orderApi = {
  placeOrder: (data) => axiosInstance.post('/api/v1/orders', data),
  getMyOrders: (params) => axiosInstance.get('/api/v1/orders', { params }),
  getById: (id) => axiosInstance.get(`/api/v1/orders/${id}`),
  trackOrder: (id) => axiosInstance.get(`/api/v1/orders/${id}/track`),
  cancel: (id, reason) => axiosInstance.post(`/api/v1/orders/${id}/cancel`, { reason }),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/api/v1/orders/${id}/status`, null, { params: { status } }),
  getCoupons: () => axiosInstance.get('/api/v1/coupons'),
  validateCoupon: (code, orderAmount) =>
    axiosInstance.post('/api/v1/coupons/validate', null, { params: { code, orderAmount } }),
};
