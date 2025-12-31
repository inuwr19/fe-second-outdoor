import { apiGet, apiPut } from '@/lib/api';
import { create } from 'zustand';

type AdminUserLite = {
  id: number;
  name: string;
  email: string;
};

export type AdminShipment = {
  id: number;
  courier?: string | null;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'delivered' | 'returned';
  shipped_at?: string | null;
  delivered_at?: string | null;
};

export type AdminOrder = {
  id: number;
  order_number: string;
  status: string; // paid, pending_payment, expired, failed
  total: number;
  created_at: string;

  user: AdminUserLite;
  shipment?: AdminShipment | null;
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type ShipPayload = {
  courier?: string | null;
  tracking_number: string;
};

interface AdminOrderState {
  orders: AdminOrder[];
  loading: boolean;
  error?: string;

  currentPage: number;
  lastPage: number;
  total: number;

  fetchOrders: (params?: { page?: number; status?: string }) => Promise<void>;
  fetchOrder: (orderNumber: string) => Promise<AdminOrder | undefined>;

  shipOrder: (orderNumber: string, payload: ShipPayload) => Promise<void>;
}

export const useAdminOrderStore = create<AdminOrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: undefined,
  currentPage: 1,
  lastPage: 1,
  total: 0,

  fetchOrders: async (params) => {
    const page = params?.page ?? 1;
    const status = params?.status;

    set({ loading: true, error: undefined });
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (status) qs.set('status', status);

      const res = await apiGet<Paginator<AdminOrder>>(`/admin/orders?${qs.toString()}`);
      set({
        loading: false,
        orders: res.data ?? [],
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
      });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Gagal memuat orders' });
    }
  },

  fetchOrder: async (orderNumber) => {
    set({ loading: true, error: undefined });
    try {
      const res = await apiGet<AdminOrder>(`/admin/orders/${orderNumber}`);
      set({ loading: false });
      return res;
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Gagal memuat detail order' });
      return undefined;
    }
  },

  shipOrder: async (orderNumber, payload) => {
    await apiPut(`/admin/orders/${orderNumber}/ship`, payload);
    // refresh list yang sedang tampil
    await get().fetchOrders({ page: get().currentPage, status: 'paid' });
  },
}));
