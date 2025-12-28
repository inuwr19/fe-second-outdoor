import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Landmark,
  Loader2,
  RefreshCcw,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type PaymentMethod = 'bank_transfer' | 'va' | 'ewallet';

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  name: string;
  description: string;
  icon: any;
}> = [
  { id: 'bank_transfer', name: 'Transfer Bank', description: 'Transfer via Midtrans', icon: Landmark },
  { id: 'va', name: 'Virtual Account', description: 'VA via Midtrans', icon: Building2 },
  { id: 'ewallet', name: 'E-Wallet', description: 'E-Wallet via Midtrans', icon: Wallet },
];

type ApiOrder = {
  order_number: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  created_at?: string;
  user?: { name: string; email: string; phone?: string; address?: string };
  items: Array<{
    id: number;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  payment?: {
    status?: string;
    snap_token?: string;
    method?: string | null;
    transaction_status?: string | null;
  };
};

type PaymentStatusRes = {
  order_status: string;
  payment: any;
};

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const { user } = useAuthStore();

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string | undefined;
  const isProd = (import.meta.env.VITE_MIDTRANS_IS_PRODUCTION as string) === 'true';
  const snapUrl = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [status, setStatus] = useState<PaymentStatusRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!clientKey) return;

    const existing = document.querySelector(`script[src="${snapUrl}"]`) as HTMLScriptElement | null;
    if (existing) {
      setSnapReady(true);
      return;
    }

    const s = document.createElement('script');
    s.src = snapUrl;
    s.setAttribute('data-client-key', clientKey);
    s.async = true;
    s.onload = () => setSnapReady(true);
    s.onerror = () => setSnapReady(false);
    document.body.appendChild(s);
  }, [clientKey, snapUrl]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const fetchAll = async () => {
    if (!orderNumber) return;
    setLoading(true);
    try {
      const [orderJson, statusJson] = await Promise.all([
        apiGet<ApiOrder>(`/orders/${orderNumber}`),
        apiGet<PaymentStatusRes>(`/payments/${orderNumber}/status`),
      ]);

      setOrder(orderJson);
      setStatus(statusJson);
    } catch (e: any) {
      toast.error(e?.message ?? 'Terjadi kesalahan.');
      setOrder(null);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const refreshStatus = async () => {
    if (!orderNumber) return;
    setRefreshing(true);
    try {
      await apiPost(`/payments/${orderNumber}/refresh`, {});
      await fetchAll();
      toast.success('Status pembayaran diperbarui.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Gagal refresh status.');
    } finally {
      setRefreshing(false);
    }
  };

  const snapToken = order?.payment?.snap_token;

  const orderStatus = status?.order_status ?? order?.status;
  const trxStatus = status?.payment?.transaction_status ?? order?.payment?.transaction_status;

  const isPaid = orderStatus === 'paid';
  const isPending = orderStatus === 'pending_payment' || trxStatus === 'pending' || order?.payment?.status === 'pending';
  const isExpired = orderStatus === 'expired';
  const isFailed = orderStatus === 'failed';

  const statusUI = useMemo(() => {
    if (isPaid) return { label: 'Pembayaran Berhasil', variant: 'default' as const, icon: CheckCircle2 };
    if (isExpired) return { label: 'Pembayaran Kedaluwarsa', variant: 'destructive' as const, icon: XCircle };
    if (isFailed) return { label: 'Pembayaran Gagal', variant: 'destructive' as const, icon: XCircle };
    if (isPending) return { label: 'Menunggu Pembayaran', variant: 'secondary' as const, icon: Clock3 };
    return { label: 'Diproses', variant: 'secondary' as const, icon: Clock3 };
  }, [isPaid, isExpired, isFailed, isPending]);

  const handlePay = async () => {
    if (!snapToken) {
      toast.error('Snap token tidak tersedia.');
      return;
    }
    if (!snapReady || !window.snap?.pay) {
      toast.error('Midtrans Snap belum siap. Coba refresh halaman.');
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: async () => {
        await refreshStatus();
      },
      onPending: async () => {
        await refreshStatus();
      },
      onError: async () => {
        await refreshStatus();
        toast.error('Pembayaran gagal.');
      },
      onClose: async () => {
        await refreshStatus();
        toast.info('Popup pembayaran ditutup.');
      },
    });
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Konfirmasi Pembayaran - Second Outdoor</title>
        <meta name="description" content="Cek status dan selesaikan pembayaran pesanan Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Konfirmasi Pembayaran</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {orderNumber ? `Order: ${orderNumber}` : 'Order tidak ditemukan'}
              </p>
            </div>

            <Badge variant={statusUI.variant} className="px-3 py-1">
              <statusUI.icon className="w-4 h-4 mr-2 inline-block" />
              {statusUI.label}
            </Badge>
          </div>

          {loading ? (
            <div className="glass-card rounded-xl p-6 text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat data…
            </div>
          ) : !order ? (
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm text-destructive">Data order tidak tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Data Penerima</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama</Label>
                      <InputLike value={order.user?.name ?? user.name} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <InputLike value={order.user?.email ?? user.email} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>No. HP</Label>
                      <InputLike value={(order.user?.phone ?? user.phone ?? '-') as string} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Alamat</Label>
                      <div className="mt-1 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm whitespace-pre-line">
                        {order.user?.address ?? user.address ?? '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Item Pesanan</h2>
                  <div className="space-y-3">
                    {order.items?.map((it) => (
                      <div key={it.id} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{it.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Size {it.size} • Qty: {it.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(it.price)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="outline" onClick={refreshStatus} disabled={refreshing} className="h-11">
                      {refreshing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Refreshing…
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Refresh Status
                        </>
                      )}
                    </Button>

                    {(isExpired || isFailed) && (
                      <Button onClick={() => navigate('/products')} className="h-11">
                        Kembali Belanja
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="glass-card rounded-xl p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Ringkasan Pembayaran</h2>

                  <div className="mb-5">
                    <Label className="text-sm font-semibold">Metode Pembayaran</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                      className="space-y-2 mt-2"
                    >
                      {PAYMENT_OPTIONS.map((m) => (
                        <label
                          key={m.id}
                          htmlFor={m.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                            paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={m.id} id={m.id} />
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <m.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.description}</div>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground mt-2">
                      Setelah klik bayar, Midtrans akan menampilkan opsi pembayaran yang tersedia.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4 mt-5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      <span className="font-medium">{formatPrice(order.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PPN</span>
                      <span className="font-medium">{formatPrice(order.tax)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>

                    {!isPaid && (
                      <Button onClick={handlePay} disabled={!snapToken || !snapReady} className="w-full h-12 mt-2 text-base">
                        {!snapReady ? 'Memuat Midtrans…' : `Bayar ${formatPrice(order.total)}`}
                      </Button>
                    )}

                    {isPaid && (
                      <Button onClick={() => navigate('/orders')} className="w-full h-12 mt-2 text-base">
                        Lihat Riwayat Pesanan
                      </Button>
                    )}

                    <div className="pt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Status Order</span>
                        <span className="font-medium">{orderStatus ?? '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status Midtrans</span>
                        <span className="font-medium">{trxStatus ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const InputLike = ({ value }: { value: string }) => (
  <div className="mt-1 h-11 rounded-md border border-input bg-muted/30 px-3 flex items-center text-sm">
    {value}
  </div>
);

export default PaymentConfirmation;
