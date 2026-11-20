import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '../../stores/toast.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    if (status === 401) {
      // Don't toast error on /auth/me check failures to prevent spamming on first load
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck) {
        toast.error('Session expired. Please log in again.', 'Unauthorized');
      }

      // If not already on /login, redirect
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 422 || status === 400) {
      toast.error(message, 'Validation Error');
    } else if (status && status >= 500) {
      toast.error(message, 'Server Error');
    }

    return Promise.reject(error);
  },
);

export default api;
