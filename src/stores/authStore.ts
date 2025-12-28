import { User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null
          });
          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Terjadi kesalahan saat login'
          });
          return false;
        }
      },

      register: async (name, email, password, password_confirmation) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ name, email, password, password_confirmation }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null
          });
          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Terjadi kesalahan saat registrasi'
          });
          return false;
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
            try {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
        set({ user: null, token: null, error: null });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'thrift-auth',
    }
  )
);
