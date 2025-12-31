import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiGet } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

type InvoiceApi = {
  invoice_number: string | null;
  order_number: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  status: string;
};

const Invoice = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [data, setData] = useState<InvoiceApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const run = async () => {
      if (!orderNumber) return;

      setLoading(true);
      setErr(null);
      try {
        const res = await apiGet<InvoiceApi>(`/orders/${orderNumber}/invoice`);
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? 'Gagal memuat invoice.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [orderNumber]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(iso),
    );

  const statusLabel = useMemo(() => {
    const s = data?.status;
    if (s === 'paid') return { text: 'LUNAS', className: 'bg-success/10 text-success' };
    if (s === 'pending_payment')
      return { text: 'MENUNGGU PEMBAYARAN', className: 'bg-secondary/10 text-secondary' };
    if (s === 'expired')
      return { text: 'KEDALUWARSA', className: 'bg-destructive/10 text-destructive' };
    if (s === 'failed') return { text: 'GAGAL', className: 'bg-destructive/10 text-destructive' };
    return { text: s ?? 'STATUS', className: 'bg-muted text-muted-foreground' };
  }, [data?.status]);

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Invoice - Second Outdoor</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="print:hidden flex gap-3 mb-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>

          {loading ? (
            <div className="glass-card rounded-xl p-6 text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat invoice…
            </div>
          ) : err ? (
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm text-destructive">{err}</p>
            </div>
          ) : !data ? (
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Invoice tidak ditemukan.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 shadow-lg print:shadow-none border border-border">
              {/* Header */}
              <div className="flex justify-between items-start gap-6 mb-8">
                <div>
                  <h1 className="font-display text-2xl font-bold text-primary">Second Outdoor</h1>
                  <p className="text-sm text-muted-foreground">Sustainable Fashion Store</p>

                  <div className="mt-3 text-sm text-muted-foreground space-y-1">
                    <div>
                      Order:{' '}
                      <span className="font-medium text-foreground">{data.order_number}</span>
                    </div>
                    <div>
                      Invoice:{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {data.invoice_number ?? '-'}
                      </span>
                    </div>
                    <div>
                      Tanggal:{' '}
                      <span className="font-medium text-foreground">{formatDate(data.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusLabel.className}`}
                  >
                    {statusLabel.text}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold mb-2">Tagihan Kepada</h3>
                  <p className="font-medium">{data.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{data.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{data.customer.phone ?? '-'}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {data.customer.address ?? '-'}
                  </p>
                </div>

                <div className="md:text-right">
                  <h3 className="font-semibold mb-2">Ringkasan</h3>
                  <div className="text-sm text-muted-foreground">
                    Simpan invoice ini sebagai bukti transaksi.
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="overflow-x-auto">
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 text-sm font-semibold">Produk</th>
                      <th className="text-center py-3 text-sm font-semibold">Qty</th>
                      <th className="text-right py-3 text-sm font-semibold">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((it) => (
                      <tr key={it.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{it.product_name}</div>
                          <div className="text-sm text-muted-foreground">Size: {it.size}</div>
                        </td>
                        <td className="text-center py-3">{it.quantity}</td>
                        <td className="text-right py-3">{formatPrice(it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(data.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="font-medium">{formatPrice(data.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN (11%)</span>
                    <span className="font-medium">{formatPrice(data.tax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(data.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                Terima kasih telah berbelanja di Second Outdoor.
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Invoice;
