import { create } from 'zustand';
import axios from 'axios';
import useWishlistStore from './wishlistStore';

const useAuthStore = create((set) => {
  const loadWishlist = () => useWishlistStore.getState().loadWishlist();

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,

    login: (userData, token) => {
      localStorage.setItem('avenues_user', JSON.stringify(userData));
      set({ user: userData, token, isAuthenticated: true });
      loadWishlist();
    },

    logout: () => {
      localStorage.removeItem('avenues_user');
      set({ user: null, token: null, isAuthenticated: false });
      useWishlistStore.getState().clearWishlist();
    },

    setUser: (userData) => {
      localStorage.setItem('avenues_user', JSON.stringify(userData));
      set({ user: userData });
    },

    loadUser: async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        set({ user: data, isAuthenticated: true });
        loadWishlist();
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
  };
});

export default useAuthStore;
