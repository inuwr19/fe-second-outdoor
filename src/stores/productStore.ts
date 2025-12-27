import { create } from 'zustand';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';

interface ProductState {
  products: Product[];
  markAsSold: (productId: string) => void;
  markMultipleAsSold: (productIds: string[]) => void;
  getProduct: (productId: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  
  markAsSold: (productId: string) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId ? { ...product, stock: 0 } : product
      ),
    }));
  },
  
  markMultipleAsSold: (productIds: string[]) => {
    set((state) => ({
      products: state.products.map((product) =>
        productIds.includes(product.id) ? { ...product, stock: 0 } : product
      ),
    }));
  },
  
  getProduct: (productId: string) => {
    return get().products.find((product) => product.id === productId);
  },
}));
