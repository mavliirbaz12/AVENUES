import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  toasts: [],
  isMobileMenuOpen: false,
  searchQuery: '',

  addToast: (toast) => {
    const id = Date.now();
    const newToast = { id, duration: 3000, ...toast };
    set({ toasts: [...get().toasts, newToast] });

    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export default useUIStore;
