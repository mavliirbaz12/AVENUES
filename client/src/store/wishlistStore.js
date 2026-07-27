import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import useAuthStore from './authStore';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: async (product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const items = get().items;
        const exists = items.find((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
          if (isAuthenticated) {
            try {
              await axios.post('/api/users/wishlist/toggle', { productId: product._id || product.id });
            } catch { /* ignore */ }
          }
          return false;
        } else {
          set({ items: [...items, product] });
          if (isAuthenticated) {
            try {
              await axios.post('/api/users/wishlist/toggle', { productId: product._id || product.id });
            } catch { /* ignore */ }
          }
          return true;
        }
      },

      removeItem: async (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await axios.post('/api/users/wishlist/toggle', { productId });
          } catch { /* ignore */ }
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      getItemCount: () => get().items.length,

      loadWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        try {
          const { data } = await axios.get('/api/users/wishlist');
          set({ items: data.map((p) => ({ id: p._id, ...p })) });
        } catch { /* ignore */ }
      },
    }),
    {
      name: 'avenues-wishlist',
    }
  )
);

export default useWishlistStore;
