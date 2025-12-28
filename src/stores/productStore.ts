import { apiGet, storageUrl } from '@/lib/api';
import { Product } from '@/types';
import { create } from 'zustand';

type ApiProductImage = {
  id: number;
  path: string;
  is_primary?: number | boolean;
  sort_order?: number;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  size: string;
  stock: number;
  status: string;
  created_at: string;
  images: ApiProductImage[];
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function conditionLabel(cond: ApiProduct['condition']): Product['conditionLabel'] {
  switch (cond) {
    case 'new':
      return 'New';
    case 'like_new':
      return 'Like New';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    default:
      return 'Good';
  }
}

function pickPrimaryImage(images: ApiProductImage[]): string {
  if (!images?.length) return '';
  const primary =
    images.find((x) => Boolean(x.is_primary)) ??
    [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  return storageUrl(primary?.path);
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    description: p.description ?? '',
    category: p.category ?? 'other',
    condition: p.condition,
    conditionLabel: conditionLabel(p.condition),
    size: p.size ?? 'ONE_SIZE',
    stock: Number(p.stock ?? 0),
    image: pickPrimaryImage(p.images ?? []),
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

type ProductQuery = {
  search?: string;
  category?: string; // backend: category
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'oldest'; // sesuai backend anda (oldest opsional)
  page?: number;
};

function toQueryString(params: ProductQuery) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || v === 'All') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error?: string;

  // pagination dari backend
  currentPage: number;
  lastPage: number;
  total: number;

  fetchProducts: (params?: ProductQuery) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<Product | undefined>;

  // getter local
  getProductBySlug: (slug: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: undefined,

  currentPage: 1,
  lastPage: 1,
  total: 0,

  fetchProducts: async (params) => {
    set({ loading: true, error: undefined });
    try {
      const qs = toQueryString(params ?? {});
      const res = await apiGet<Paginator<ApiProduct>>(`/products${qs}`);
      set({
        products: (res.data ?? []).map(mapProduct),
        loading: false,
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message ?? 'Gagal memuat produk',
      });
    }
  },

  fetchProductBySlug: async (slug) => {
    const cached = get().products.find((p) => p.slug === slug);
    if (cached) return cached;

    set({ loading: true, error: undefined });
    try {
      const res = await apiGet<ApiProduct>(`/products/${slug}`);
      const mapped = mapProduct(res);

      // merge cache
      set((state) => ({
        loading: false,
        products: state.products.some((p) => p.slug === slug)
          ? state.products
          : [mapped, ...state.products],
      }));

      return mapped;
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Gagal memuat detail produk' });
      return undefined;
    }
  },

  getProductBySlug: (slug) => get().products.find((p) => p.slug === slug),
}));
