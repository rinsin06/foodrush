import axiosInstance from './axiosInstance.js';

export const authApi = {
  login: (data) => axiosInstance.post('/api/v1/auth/login', data),
  register: (data) => axiosInstance.post('/api/v1/auth/register', data),
  logout: () => axiosInstance.post('/api/v1/auth/logout'),
  refreshToken: (refreshToken) => axiosInstance.post('/api/v1/auth/refresh-token', { refreshToken }),
  validate: () => axiosInstance.get('/api/v1/auth/validate'),
  getProfile: () => axiosInstance.get('/api/v1/auth/me'),
  updateProfile: (data) => axiosInstance.put('/api/v1/auth/me', data),
  changePassword: (data) => axiosInstance.post('/api/v1/auth/change-password', data),
};
