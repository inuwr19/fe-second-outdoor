import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api';
import { useTransactionStore } from '@/stores/transactionStore';
import { ArrowRight, CheckCircle, FileText, Truck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';

type Shipment = {
  id: number;
  courier?: string | null;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'delivered' | 'returned';
  shipped_at?: string | null;
  delivered_at?: string | null;
};

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
};

type OrderDetail = {
  id: number;
  order_number: string;
  status: string; // paid, pending_payment, etc
  total: number;
  created_at: string;
  items: OrderItem[];
  shipment?: Shipment | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
};

function shippingLabel(sh?: Shipment | null) {
  if (!sh) return { label: 'Belum dikirim', badge: 'bg-warning text-warning-foreground' };
  if (sh.status === 'delivered')
    return { label: 'Diterima', badge: 'bg-success text-success-foreground' };
  if (sh.status === 'returned')
    return { label: 'Dikembalikan', badge: 'bg-destructive text-destructive-foreground' };
  if (sh.status === 'pending')
    return { label: 'Menunggu diproses', badge: 'bg-accent text-accent-foreground' };
  return { label: 'Dikirim', badge: 'bg-success text-success-foreground' }; // shipped default
}

const TransactionResult = () => {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status'); // success|failed
  const orderNumber =
    searchParams.get('orderNumber') ||
    searchParams.get('order_number') ||
    searchParams.get('order'); // fallback

  // fallback lama (kalau Anda masih kirim txnId)
  const txnId = searchParams.get('txnId');
  const { getTransaction } = useTransactionStore();
  const localTxn = txnId ? getTransaction(txnId) : null;

  const isSuccess = status === 'success';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const hasBackendOrder = useMemo(
    () => Boolean(orderNumber && isSuccess),
    [orderNumber, isSuccess],
  );

  useEffect(() => {
    if (!hasBackendOrder || !orderNumber) return;

    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        const res = await apiGet<OrderDetail>(`/orders/${orderNumber}`);
        setOrder(res);
      } catch (e: any) {
        setErrMsg(e?.message ?? 'Gagal memuat detail order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [hasBackendOrder, orderNumber]);

  const shipmentInfo = shippingLabel(order?.shipment);

  const itemCount = order?.items?.length ?? localTxn?.items?.length ?? 0;
  const totalPaid = Number(order?.total ?? localTxn?.total ?? 0);

  return (
    <>
      <Helmet>
        <title>{isSuccess ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'} - Second Outdoor</title>
        <meta
          name="description"
          content={isSuccess ? 'Pembayaran Anda berhasil diproses.' : 'Pembayaran Anda gagal.'}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            {/* Status Icon */}
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-scale-in ${
                isSuccess ? 'bg-success/10' : 'bg-destructive/10'
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>

            {/* Status Text */}
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 animate-fade-in">
              {isSuccess ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal'}
            </h1>
            <p
              className="text-muted-foreground mb-8 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              {isSuccess
                ? 'Terima kasih! Pesanan Anda sedang diproses.'
                : 'Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.'}
            </p>

            {/* Error backend (opsional) */}
            {isSuccess && orderNumber && errMsg && (
              <div className="mb-6 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm text-left">
                {errMsg}
              </div>
            )}

            {/* Transaction Details */}
            {isSuccess && (order || localTxn) && (
              <div
                className="glass-card rounded-xl p-6 mb-8 text-left animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                <h3 className="font-semibold mb-4 text-center">Detail Transaksi</h3>

                {loading ? (
                  <div className="py-6 text-center text-muted-foreground">Memuat detail…</div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-mono text-right">
                        {order?.order_number ?? orderNumber ?? localTxn?.id ?? '-'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Item</span>
                      <span>{itemCount} item</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold text-primary">{formatPrice(totalPaid)}</span>
                    </div>

                    {/* NEW: Shipping Status */}
                    <div className="pt-3 mt-3 border-t border-border/60">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Status Pengiriman
                        </span>
                        <Badge className={shipmentInfo.badge}>{shipmentInfo.label}</Badge>
                      </div>

                      {order?.shipment && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Kurir</span>
                            <span className="text-right">{order.shipment.courier || '-'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Resi</span>
                            <span className="font-mono text-right">
                              {order.shipment.tracking_number}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Tanggal Kirim</span>
                            <span className="text-right">
                              {formatDate(order.shipment.shipped_at)}
                            </span>
                          </div>
                        </div>
                      )}

                      {!order?.shipment && orderNumber && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Resi akan muncul setelah admin mengirim barang.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Invoice link harus pakai orderNumber (backend) */}
              {isSuccess && orderNumber && (
                <Button asChild className="w-full h-12">
                  <Link to={`/invoice/${orderNumber}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Link>
                </Button>
              )}

              <Button asChild variant={isSuccess ? 'outline' : 'default'} className="w-full h-12">
                <Link to="/products">
                  {isSuccess ? 'Lanjut Belanja' : 'Coba Lagi'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              {isSuccess && (
                <Button asChild variant="ghost" className="w-full h-12">
                  <Link to="/history">Lihat Riwayat Transaksi</Link>
                </Button>
              )}
            </div>

            {/* Hint jika success tapi tidak ada orderNumber */}
            {isSuccess && !orderNumber && (
              <p className="mt-6 text-xs text-muted-foreground">
                Catatan: agar status pengiriman tampil, pastikan redirect ke halaman ini membawa
                query
                <span className="font-mono"> ?status=success&amp;orderNumber=ORD-...</span>
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default TransactionResult;
