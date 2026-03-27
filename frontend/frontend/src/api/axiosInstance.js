import axios from 'axios';
import { setTokens, clearAuth } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

// Lazy accessor — breaks circular import cycle
let _store;
export const injectStore = (s) => { _store = s; };
const getStore = () => _store;

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStore()?.getState().auth.accessToken;
    if (token) {
      console.log(token);
      
      config.headers.Authorization = `Bearer ${token}`;

        console.log(config);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 & silent token refresh ─────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(original);
          })
          .catch(Promise.reject);
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getStore()?.getState().auth.refreshToken;

      if (!refreshToken) {
        getStore()?.dispatch(clearAuth());
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/refresh-token`,
          { refreshToken }
        );

        getStore()?.dispatch(setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }));

        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        getStore()?.dispatch(clearAuth());
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Global error handling
    if (error.response?.status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;