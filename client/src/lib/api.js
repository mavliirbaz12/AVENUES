/**
 * Global axios instance with auth interceptor.
 * Import this instead of 'axios' throughout the app so every
 * request automatically includes the JWT as a Bearer token.
 *
 * Usage:  import api from '@/lib/api';
 *         const { data } = await api.get('/api/products');
 */
import axios from 'axios';

const api = axios.create({
  withCredentials: true, // also send cookies for HttpOnly token
});

// Attach JWT from Zustand store to every request
api.interceptors.request.use((config) => {
  // Lazy-import to avoid circular dependency
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: useAuthStore } = require('@/store/authStore');
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Store not ready — continue without token
  }
  return config;
});

// Global 401 handler — log out and redirect to login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { default: useAuthStore } = require('@/store/authStore');
        useAuthStore.getState().logout();
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
