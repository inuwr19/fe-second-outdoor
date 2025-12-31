import { apiDelete, apiGet, apiPostForm, storageUrl } from '@/lib/api';
import { create } from 'zustand';

type ApiProductImage = {
  id: number;
  path: string;
  is_primary?: number | boolean;
  sort_order?: number;
};

export type AdminProduct = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: number;
  description?: string | null;
  category?: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'reserved' | 'sold_out' | 'inactive';
  stock: 0 | 1;
  size?: string | null;
  created_at?: string;
  images: ApiProductImage[];
};

export type AdminProductFormPayload = {
  sku: string;
  name: string;
  slug?: string | null;
  price: number;
  description?: string | null;
  category?: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'reserved' | 'sold_out' | 'inactive';
  stock: 0 | 1;

  // upload
  images?: File[];
  primary_index?: number;
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function pickPrimaryImage(images: ApiProductImage[]): string {
  if (!images?.length) return '';
  const primary =
    images.find((x) => Boolean(x.is_primary)) ??
    [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  return storageUrl(primary?.path);
}

function buildProductFormData(payload: AdminProductFormPayload, methodOverride?: 'PUT') {
  const fd = new FormData();

  // penting untuk update: POST + _method=PUT
  if (methodOverride) fd.append('_method', methodOverride);

  // required fields
  fd.append('sku', payload.sku);
  fd.append('name', payload.name);
  fd.append('price', String(payload.price));
  fd.append('condition', payload.condition);
  fd.append('status', payload.status);
  fd.append('stock', String(payload.stock));

  // optional fields: hanya append jika ada isi
  if (payload.slug) fd.append('slug', payload.slug);
  if (payload.description) fd.append('description', payload.description);
  if (payload.category) fd.append('category', payload.category);

  // images
  const files = payload.images ?? [];
  files.forEach((f) => fd.append('images[]', f));

  if (typeof payload.primary_index === 'number') {
    fd.append('primary_index', String(payload.primary_index));
  }

  return fd;
}

interface AdminProductState {
  products: AdminProduct[];
  loading: boolean;
  error?: string;

  currentPage: number;
  lastPage: number;
  total: number;

  fetchProducts: (page?: number) => Promise<void>;
  fetchProduct: (id: number) => Promise<AdminProduct | undefined>;

  createProduct: (payload: AdminProductFormPayload) => Promise<AdminProduct>;
  updateProduct: (id: number, payload: AdminProductFormPayload) => Promise<AdminProduct>;
  deleteProduct: (id: number) => Promise<void>;

  primaryImageUrl: (p: AdminProduct) => string;
}

export const useAdminProductStore = create<AdminProductState>((set, get) => ({
  products: [],
  loading: false,
  error: undefined,

  currentPage: 1,
  lastPage: 1,
  total: 0,

  primaryImageUrl: (p) => pickPrimaryImage(p.images ?? []),

  fetchProducts: async (page = 1) => {
    set({ loading: true, error: undefined });
    try {
      const res = await apiGet<Paginator<AdminProduct>>(`/admin/products?page=${page}`);
      set({
        loading: false,
        products: res.data ?? [],
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
      });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Gagal memuat produk' });
    }
  },

  fetchProduct: async (id) => {
    const cached = get().products.find((p) => p.id === id);
    if (cached) return cached;

    set({ loading: true, error: undefined });
    try {
      const res = await apiGet<AdminProduct>(`/admin/products/${id}`);
      set({ loading: false });
      return res;
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Gagal memuat detail produk' });
      return undefined;
    }
  },

  createProduct: async (payload) => {
    const fd = buildProductFormData(payload);
    const res = await apiPostForm<AdminProduct>(`/admin/products`, fd);
    await get().fetchProducts(1);
    return res;
  },

  updateProduct: async (id, payload) => {
    // update: POST + _method=PUT supaya upload aman
    const fd = buildProductFormData(payload as AdminProductFormPayload, 'PUT');
    const res = await apiPostForm<AdminProduct>(`/admin/products/${id}`, fd);
    await get().fetchProducts(get().currentPage);
    return res;
  },

  deleteProduct: async (id) => {
    await apiDelete(`/admin/products/${id}`);
    await get().fetchProducts(get().currentPage);
  },
}));
