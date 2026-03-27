import axiosInstance from './axiosInstance.js';

export const restaurantApi = {
  getAll: (params) => axiosInstance.get('/api/v1/restaurants', { params }),
  search: (params) => axiosInstance.get('/api/v1/restaurants/search', { params }),
  getById: (id) => axiosInstance.get(`/api/v1/restaurants/${id}`),
  getNearby: (params) => axiosInstance.get('/api/v1/restaurants/nearby', { params }),
  getMenu: (restaurantId, vegOnly) =>
    axiosInstance.get(`/api/v1/restaurants/${restaurantId}/menu`, { params: { vegOnly } }),
  getMenuItems: (restaurantId, params) =>
    axiosInstance.get(`/api/v1/restaurants/${restaurantId}/menu/items`, { params }),
  create: (data) => axiosInstance.post('/api/v1/restaurants', data),
  update: (id, data) => axiosInstance.put(`/api/v1/restaurants/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/v1/restaurants/${id}`),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/api/v1/restaurants/${id}/status`, null, { params: { status } }),
  getMyRestaurants: () => axiosInstance.get('/api/v1/restaurants/my'),
  addMenuItem: (restaurantId, data) =>
    axiosInstance.post(`/api/v1/restaurants/${restaurantId}/menu/items`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    axiosInstance.put(`/api/v1/restaurants/${restaurantId}/menu/items/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    axiosInstance.delete(`/api/v1/restaurants/${restaurantId}/menu/items/${itemId}`),
  addCategory: (restaurantId, data) =>
    axiosInstance.post(`/api/v1/restaurants/${restaurantId}/menu/categories`, data),
};
