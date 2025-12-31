import { apiGet, apiPost } from '@/lib/api';
import type {
  CartItem,
  Invoice,
  PaymentMethod,
  Product,
  Transaction,
  TransactionStatus,
  User,
} from '@/types';
import { create } from 'zustand';

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  successOrders: number;
  totalSpent: number;
};

type MonthlySpendingPoint = { name: string; total: number };

type BackendDashboardResponse = {
  user: any;
  stats: DashboardStats;
  recentTransactions: any[];
  monthlySpending: MonthlySpendingPoint[];
};

interface TransactionState {
  // ====== dashboard-linked ======
  transactions: Transaction[]; // dipakai Dashboard untuk transaksi terbaru
  dashboardStats: DashboardStats | null;
  monthlySpending: MonthlySpendingPoint[];

  isLoadingDashboard: boolean;
  dashboardError: string | null;
  hasLoadedDashboard: boolean;

  fetchMyDashboard: (opts?: { recent?: number; months?: number }) => Promise<void>;

  // ====== existing helpers (tetap ada agar tidak merusak kode lain) ======
  currentTransaction: Transaction | null;

  // Local-only fallback (sebaiknya tidak dipakai jika sudah backend checkout)
  createTransaction: (
    items: CartItem[],
    paymentMethod: PaymentMethod,
    userId: string,
  ) => Transaction;

  updateTransactionStatus: (transactionId: string, status: TransactionStatus) => void;

  getTransaction: (transactionId: string) => Transaction | undefined;

  // Dashboard lama memanggil ini: getUserTransactions(user.id)
  // Kini akan mengembalikan state.transactions (hasil fetchMyDashboard)
  getUserTransactions: (userId: string) => Transaction[];

  // Backend invoice (opsional untuk halaman invoice)
  fetchInvoice: (orderNumber: string) => Promise<Invoice | null>;

  // Fallback lokal (tetap dipertahankan)
  generateInvoice: (transactionId: string, user: User) => Invoice | null;

  // Refresh status pembayaran dari backend (opsional)
  refreshTransactionStatus: (orderNumber: string) => Promise<TransactionStatus | null>;
}

function mapBackendStatusToFrontendStatus(raw: unknown): TransactionStatus {
  const s = String(raw ?? '')
    .toLowerCase()
    .trim();

  // jika backend service Anda sudah mengirim pending|processing|success|failed
  if (s === 'pending' || s === 'processing' || s === 'success' || s === 'failed') return s;

  // mapping status order dari backend Anda: pending_payment, paid, expired, failed, etc
  if (s === 'paid') return 'success';
  if (s === 'pending_payment') return 'pending';
  if (s === 'expired' || s === 'failed' || s === 'cancel' || s === 'deny') return 'failed';

  // mapping status payment umum: initiated/pending/success/expired/failed
  if (s === 'initiated') return 'processing';
  if (s === 'settlement' || s === 'capture') return 'success';

  return 'processing';
}

function conditionToLabel(c: string): Product['conditionLabel'] {
  switch (c) {
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

function normalizePaymentMethod(raw: any): PaymentMethod {
  const m = String(raw ?? '').toLowerCase();
  if (m === 'bank_transfer') return 'bank_transfer';
  if (m === 'e_wallet' || m === 'ewallet') return 'e_wallet';
  if (m === 'cod') return 'cod';
  // fallback aman
  return 'bank_transfer';
}

/**
 * Backend item (order_items) tidak punya semua field Product.
 * Karena CartItem di FE mewajibkan product: Product, kita buat "stub product"
 * agar Dashboard tetap bisa pakai items.length dan UI lain tidak crash.
 */
function orderItemToCartItem(it: any): CartItem {
  const condition = (String(it?.condition ?? 'good') as Product['condition']) || 'good';

  const productStub: Product = {
    id: String(it?.product_id ?? it?.productId ?? ''),
    slug: String(it?.product_sku ?? it?.productSku ?? it?.product_id ?? ''),
    name: String(it?.product_name ?? it?.productName ?? ''),
    price: Number(it?.price ?? 0),
    description: '',
    category: '',
    condition,
    conditionLabel: conditionToLabel(condition),
    size: String(it?.size ?? 'ONE_SIZE'),
    stock: 0,
    image: '',
    createdAt: new Date().toISOString(),
  };

  return {
    id: it?.id ? String(it.id) : undefined,
    product: productStub,
    quantity: Number(it?.quantity ?? 1),
    price_snapshot: Number(it?.price ?? 0),
  };
}

function backendOrderToTransaction(order: any, fallbackUserId: string): Transaction {
  const id = String(order?.id ?? order?.order_number ?? order?.orderNumber ?? '');
  const status = mapBackendStatusToFrontendStatus(order?.status);

  const createdAtIso =
    order?.createdAt ?? order?.created_at ?? order?.createdAtISO ?? order?.created_at_iso;
  const paidAtIso = order?.paidAt ?? order?.paid_at;

  const itemsRaw = Array.isArray(order?.items) ? order.items : [];
  const items = itemsRaw.map(orderItemToCartItem);

  // backend bisa mengirim paymentMethod / payment.method / method
  const paymentMethod = normalizePaymentMethod(
    order?.paymentMethod ?? order?.payment?.method ?? order?.method,
  );

  return {
    id,
    userId: String(order?.userId ?? order?.user_id ?? fallbackUserId),
    items,
    total: Number(order?.total ?? 0),
    paymentMethod,
    status,
    createdAt: createdAtIso ? new Date(createdAtIso) : new Date(),
    paidAt: paidAtIso ? new Date(paidAtIso) : undefined,
  };
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  dashboardStats: null,
  monthlySpending: [],
  isLoadingDashboard: false,
  dashboardError: null,
  hasLoadedDashboard: false,

  fetchMyDashboard: async (opts) => {
    const recent = opts?.recent ?? 5;
    const months = opts?.months ?? 6;

    set({ isLoadingDashboard: true, dashboardError: null });

    try {
      const res = await apiGet<BackendDashboardResponse>(
        `/me/dashboard?recent=${recent}&months=${months}`,
      );

      const userId = String((res as any)?.user?.id ?? '');

      const recentOrders = Array.isArray((res as any)?.recentTransactions)
        ? (res as any).recentTransactions
        : [];

      const mapped = recentOrders.map((o: any) => backendOrderToTransaction(o, userId));

      set({
        transactions: mapped,
        dashboardStats: (res as any)?.stats ?? null,
        monthlySpending: Array.isArray((res as any)?.monthlySpending)
          ? (res as any).monthlySpending
          : [],
        isLoadingDashboard: false,
        hasLoadedDashboard: true,
      });
    } catch (e: any) {
      set({
        isLoadingDashboard: false,
        dashboardError: e?.message ?? 'Gagal memuat dashboard',
        hasLoadedDashboard: true,
      });
    }
  },

  currentTransaction: null,

  // ====== local-only fallback ======
  createTransaction: (items, paymentMethod, userId) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const transaction: Transaction = {
      id: 'txn-' + Date.now(),
      userId,
      items,
      total,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
    };

    set((state) => ({
      transactions: [...state.transactions, transaction],
      currentTransaction: transaction,
    }));

    return transaction;
  },

  updateTransactionStatus: (transactionId, status) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === transactionId
          ? { ...txn, status, paidAt: status === 'success' ? new Date() : txn.paidAt }
          : txn,
      ),
      currentTransaction:
        state.currentTransaction?.id === transactionId
          ? {
              ...state.currentTransaction,
              status,
              paidAt: status === 'success' ? new Date() : state.currentTransaction.paidAt,
            }
          : state.currentTransaction,
    }));
  },

  getTransaction: (transactionId) => get().transactions.find((txn) => txn.id === transactionId),

  getUserTransactions: (userId) => {
    // Endpoint dashboard Anda adalah /me/dashboard (tidak pakai userId).
    // Trik praktis: kalau belum pernah load, auto-fetch agar Dashboard lama tetap jalan.
    if (!get().hasLoadedDashboard && !get().isLoadingDashboard) {
      void get().fetchMyDashboard({ recent: 5, months: 6 });
    }

    return get().transactions.filter((t) => String(t.userId) === String(userId));
  },

  // ====== invoice backend (opsional) ======
  fetchInvoice: async (orderNumber: string) => {
    try {
      const res = await apiGet<any>(`/orders/${encodeURIComponent(orderNumber)}/invoice`);

      // res shape dari OrderController@invoice
      const user: User = {
        id: '', // tidak selalu dikirim, tapi tidak krusial untuk invoice tampilan
        name: res?.customer?.name ?? '',
        email: res?.customer?.email ?? '',
        phone: res?.customer?.phone ?? '',
        address: res?.customer?.address ?? '',
      };

      const items: CartItem[] = Array.isArray(res?.items)
        ? res.items.map((it: any) =>
            orderItemToCartItem({
              ...it,
              product_id: it.product_id,
              product_name: it.product_name,
              product_sku: it.product_sku,
              price: it.price,
              quantity: it.quantity,
              size: it.size,
              condition: it.condition,
            }),
          )
        : [];

      const createdAt = res?.date ? new Date(res.date) : new Date();

      const invoice: Invoice = {
        id: String(res?.invoice_number ?? 'INV-' + Date.now()),
        transactionId: String(res?.order_number ?? orderNumber),
        invoiceNumber: String(res?.invoice_number ?? ''),
        user,
        items,
        subtotal: Number(res?.subtotal ?? 0),
        tax: Number(res?.tax ?? 0),
        total: Number(res?.total ?? 0),
        paymentMethod: 'bank_transfer',
        status: mapBackendStatusToFrontendStatus(res?.status),
        createdAt,
        paidAt: undefined,
      };

      return invoice;
    } catch {
      return null;
    }
  },

  // fallback local invoice (tetap ada)
  generateInvoice: (transactionId, user) => {
    const transaction = get().getTransaction(transactionId);
    if (!transaction) return null;

    const subtotal = transaction.total;
    const tax = Math.round(subtotal * 0.11);

    const invoice: Invoice = {
      id: 'inv-' + Date.now(),
      transactionId: transaction.id,
      invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      user,
      items: transaction.items,
      subtotal,
      tax,
      total: subtotal + tax,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      createdAt: transaction.createdAt,
      paidAt: transaction.paidAt,
    };

    return invoice;
  },

  // opsional: refresh status via backend PaymentController@refresh
  refreshTransactionStatus: async (orderNumber: string) => {
    try {
      const res = await apiPost<any>(`/payments/${encodeURIComponent(orderNumber)}/refresh`, {});
      const next = mapBackendStatusToFrontendStatus(res?.order_status ?? res?.payment?.status);

      // update store jika transaksi ada
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === orderNumber || t.id === String(orderNumber)
            ? { ...t, status: next, paidAt: next === 'success' ? new Date() : t.paidAt }
            : t,
        ),
      }));

      return next;
    } catch {
      return null;
    }
  },
}));
