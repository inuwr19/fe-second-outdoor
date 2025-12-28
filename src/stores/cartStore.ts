import { apiDelete, apiGet, apiPost, storageUrl } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { CartItem, Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ApiCart = {
  id: number;
  status: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price_snapshot: number;
    product: any;
  }>;
};

type AddResult = { ok: boolean; message?: string };

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addToCart: (product: Product) => Promise<AddResult>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;

  getTotal: () => number;
  isInCart: (productId: string) => boolean;

  // opsional: sync local cart -> server setelah login
  syncLocalToServer: () => Promise<void>;
}

function hasToken() {
  return !!useAuthStore.getState().token;
}

function resolveImageFromApiProduct(p: any): string {
  if (!p) return '';
  if (p.image) return p.image;

  // support berbagai bentuk: images: [{path}], images: [string]
  const imgs = p.images ?? p.product_images ?? [];
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    const path =
      typeof first === 'string'
        ? first
        : first?.path ?? first?.url ?? first?.image ?? first?.file_path ?? null;

    return storageUrl(path);
  }

  return '';
}

function mapApiCartToStateItems(cart: ApiCart): CartItem[] {
  return (cart.items ?? []).map((it) => {
    const apiProduct = it.product ?? {};
    const mappedProduct: any = {
      ...apiProduct,
      id: String(apiProduct.id ?? it.product_id),
      image: resolveImageFromApiProduct(apiProduct),
    };

    return {
      // penting: simpan cartItemId untuk operasi delete di backend
      id: String(it.id),
      product: mappedProduct as Product,
      quantity: it.quantity ?? 1,
      // kalau tipe CartItem Anda tidak punya price_snapshot, ini aman diabaikan
      ...(typeof (it as any).price_snapshot !== 'undefined' ? { price_snapshot: it.price_snapshot } : {}),
    } as any;
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        if (!hasToken()) return;

        set({ loading: true, error: null });
        try {
          const cart = await apiGet<ApiCart>('/cart');
          const items = mapApiCartToStateItems(cart);
          set({ items, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Gagal memuat cart' });
        }
      },

      addToCart: async (product: Product) => {
        const state = get();

        // Guard thrift (frontend) tetap boleh
        if (state.isInCart(product.id)) return { ok: false, message: 'Produk sudah ada di keranjang' };
        if ((product as any).stock < 1) return { ok: false, message: 'Produk tidak tersedia' };

        // Jika belum login -> local cart (persist)
        if (!hasToken()) {
          set((s) => ({
            items: [...s.items, { id: `local-${product.id}` as any, product, quantity: 1 } as any],
          }));
          return { ok: true };
        }

        // Sudah login -> backend cart
        try {
          const pid = Number(product.id);
          if (!Number.isFinite(pid)) return { ok: false, message: 'ID produk tidak valid' };

          await apiPost('/cart/items', { product_id: pid });

          // Karena addItem backend hanya return item tanpa relasi product,
          // paling aman: fetchCart() agar item.product ikut kebawa.
          await get().fetchCart();
          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message ?? 'Gagal menambah ke cart' };
        }
      },

      removeFromCart: async (productId: string) => {
        const state = get();
        const item = state.items.find((x) => x.product.id === productId);

        // jika item tidak ada, tidak perlu apa-apa
        if (!item) return;

        // guest/local
        if (!hasToken()) {
          set((s) => ({ items: s.items.filter((x) => x.product.id !== productId) }));
          return;
        }

        // server: butuh cart item id
        const cartItemId = (item as any).id;
        try {
          await apiDelete(`/cart/items/${cartItemId}`);
          set((s) => ({ items: s.items.filter((x) => x.product.id !== productId) }));
        } catch (e: any) {
          set({ error: e?.message ?? 'Gagal menghapus item cart' });
          throw e;
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item: any) => {
          // kalau ada price_snapshot dari server, pakai itu; kalau tidak pakai product.price
          const price = Number(item.price_snapshot ?? item.product.price ?? 0);
          return total + price * (item.quantity ?? 1);
        }, 0);
      },

      isInCart: (productId: string) => {
        const state = get();
        return state.items.some((item) => item.product.id === productId);
      },

      syncLocalToServer: async () => {
        // optional: panggil ini setelah login agar cart lokal ikut ke server
        if (!hasToken()) return;

        const localItems = get().items.filter((it: any) => String(it.id).startsWith('local-'));
        if (localItems.length === 0) {
          await get().fetchCart();
          return;
        }

        for (const it of localItems) {
          try {
            const pid = Number(it.product.id);
            if (!Number.isFinite(pid)) continue;
            await apiPost('/cart/items', { product_id: pid });
          } catch {
            // abaikan duplikat/produk tidak tersedia, biar UX tidak terganggu
          }
        }

        await get().fetchCart();
      },
    }),
    {
      name: 'thrift-cart',
      // opsional: supaya tidak menyimpan loading/error ke localStorage
      partialize: (s) => ({ items: s.items }),
    }
  )
);
