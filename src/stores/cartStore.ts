import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product: Product) => {
        const state = get();
        
        // Check if already in cart (thrift rule: only 1 per item)
        if (state.isInCart(product.id)) {
          return false;
        }
        
        // Check stock
        if (product.stock < 1) {
          return false;
        }
        
        set((state) => ({
          items: [...state.items, { product, quantity: 1 }],
        }));
        
        return true;
      },
      
      removeFromCart: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      isInCart: (productId: string) => {
        const state = get();
        return state.items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'thrift-cart',
    }
  )
);
