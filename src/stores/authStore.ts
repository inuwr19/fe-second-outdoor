import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { mockUser } from '@/data/mockData';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock validation
        if (email === 'user@thriftstore.com' && password === 'password123') {
          const token = 'mock-jwt-token-' + Date.now();
          set({ 
            user: mockUser, 
            token, 
            isLoading: false,
            error: null 
          });
          return true;
        } else {
          set({ 
            isLoading: false, 
            error: 'Email atau password salah. Coba: user@thriftstore.com / password123' 
          });
          return false;
        }
      },
      
      logout: () => {
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
