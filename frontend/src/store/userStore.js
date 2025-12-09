import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'flowboard-user-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Selector for isAuthenticated - derives from token
export const selectIsAuthenticated = (state) => !!state.token;

export default useUserStore;
