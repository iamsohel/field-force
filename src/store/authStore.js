import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({ error: response.error, isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      loginWithOTP: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyOTP(phone, otp);
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({ error: response.error, isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
