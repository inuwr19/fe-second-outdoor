import { API_URL } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthResponse = {
  user: User;
  token: string;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => Promise<boolean>;

  // optional: refresh user from /auth/me (berguna saat reload)
  hydrateMe: () => Promise<void>;

  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = (await safeReadJson(res)) as any;

          if (!res.ok) {
            throw new Error(data?.message || `Login failed: ${res.status}`);
          }

          const payload = data as AuthResponse;

          set({
            user: payload.user,
            token: payload.token,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || 'Terjadi kesalahan saat login',
          });
          return false;
        }
      },

      register: async (name, email, password, password_confirmation) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ name, email, password, password_confirmation }),
          });

          const data = (await safeReadJson(res)) as any;

          if (!res.ok) {
            throw new Error(data?.message || `Registration failed: ${res.status}`);
          }

          const payload = data as AuthResponse;

          set({
            user: payload.user,
            token: payload.token,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || 'Terjadi kesalahan saat registrasi',
          });
          return false;
        }
      },

      hydrateMe: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = (await safeReadJson(res)) as any;
          if (!res.ok) {
            // token invalid -> clear
            set({ user: null, token: null });
            return;
          }

          // backend Anda return { user: ... }
          set({ user: data?.user ?? null });
        } catch {
          // kalau network error, jangan hapus token; cukup biarkan
        }
      },

      logout: async () => {
        const token = get().token;

        // clear state dulu agar UI langsung berubah
        set({ user: null, token: null, error: null, isLoading: false });
        useCartStore.getState().clearCart();

        if (!token) return;

        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch {
          // tidak fatal: token sudah dibersihkan di client
        }
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
      partialize: (state) => ({ user: state.user, token: state.token }), // simpan hanya yang perlu
    },
  ),
);
