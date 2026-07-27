import { create } from 'zustand';
import axios from 'axios';
import useWishlistStore from './wishlistStore';

const useAuthStore = create((set) => {
  const loadWishlist = () => useWishlistStore.getState().loadWishlist();

  return {
    user: null,
    token: localStorage.getItem('avenues_token') || null,
    isAuthenticated: !!localStorage.getItem('avenues_token'),
    isLoading: false,

    login: (userData, token) => {
      localStorage.setItem('avenues_token', token);
      localStorage.setItem('avenues_user', JSON.stringify(userData));
      set({ user: userData, token, isAuthenticated: true });
      loadWishlist();
    },

    logout: () => {
      localStorage.removeItem('avenues_token');
      localStorage.removeItem('avenues_user');
      set({ user: null, token: null, isAuthenticated: false });
      useWishlistStore.getState().clearWishlist();
    },

    setUser: (userData) => {
      localStorage.setItem('avenues_user', JSON.stringify(userData));
      set({ user: userData });
    },

    loadUser: async () => {
      const token = localStorage.getItem('avenues_token');
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      try {
        const { data } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: data, token, isAuthenticated: true });
        loadWishlist();
      } catch {
        localStorage.removeItem('avenues_token');
        localStorage.removeItem('avenues_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
  };
});

export default useAuthStore;
