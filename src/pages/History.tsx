import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiGet } from '@/lib/api';
import { FileText, Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

type Payment = {
  id: number;
  method?: string | null; // bank_transfer, e_wallet, dll
  status?: string | null; // pending/success/failed
  provider?: string | null;
  paid_at?: string | null;
};

type Shipment = {
  id: number;
  status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | string;
  courier?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
};

type OrderRow = {
  id: number;
  order_number: string;
  invoice_number?: string | null;
  status: string; // pending_payment, paid, expired, failed, ...
  total: number;
  created_at: string;

  items_count?: number;
  payment?: Payment | null;
  shipment?: Shipment | null;
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const History = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));

  const orderStatusMeta = useMemo(() => {
    const map: Record<string, { label: string; className: string }> = {
      pending_payment: { label: 'Menunggu Bayar', className: 'bg-warning text-warning-foreground' },
      paid: { label: 'Berhasil', className: 'bg-success text-success-foreground' },
      expired: { label: 'Kedaluwarsa', className: 'bg-muted text-muted-foreground' },
      failed: { label: 'Gagal', className: 'bg-destructive text-destructive-foreground' },
      processing: { label: 'Diproses', className: 'bg-accent text-accent-foreground' },
    };
    return (s: string) => map[s] ?? { label: s, className: 'bg-muted text-muted-foreground' };
  }, []);

  const shipmentStatusMeta = useMemo(() => {
    const map: Record<string, { label: string; className: string }> = {
      pending: {
        label: 'Belum Dikirim',
        className: 'bg-muted/60 text-muted-foreground border-border/60',
      },
      packed: {
        label: 'Dikemas',
        className: 'bg-accent/15 text-foreground border-border/60',
      },
      shipped: {
        label: 'Dikirim',
        className: 'bg-success/15 text-success border-success/30',
      },
      delivered: {
        label: 'Diterima',
        className: 'bg-success/15 text-success border-success/30',
      },
      cancelled: {
        label: 'Dibatalkan',
        className: 'bg-destructive/10 text-destructive border-destructive/25',
      },
    };

    return (s?: string | null) => {
      if (!s) return map.pending;
      return (
        map[s] ?? { label: s, className: 'bg-muted/60 text-muted-foreground border-border/60' }
      );
    };
  }, []);

  const shipmentBadgeBase =
    'inline-flex w-fit items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold leading-none';

  const paymentMethodLabel = (m?: string | null) => {
    if (!m) return '-';
    return m.replace(/_/g, ' ');
  };

  const fetchOrders = async (nextPage: number, nextStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const sp = new URLSearchParams();
      sp.set('page', String(nextPage));
      if (nextStatus !== 'all') sp.set('status', nextStatus);

      const res = await apiGet<Paginator<OrderRow>>(`/orders?${sp.toString()}`);

      setRows(res.data ?? []);
      setTotal(res.total ?? 0);
      setCurrentPage(res.current_page ?? nextPage);
      setLastPage(res.last_page ?? 1);
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat riwayat transaksi');
      setRows([]);
      setTotal(0);
      setCurrentPage(1);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredCountLabel = loading ? 'Memuat...' : `${total} transaksi`;

  return (
    <>
      <Helmet>
        <title>Riwayat Transaksi - Second Outdoor</title>
        <meta name="description" content="Lihat semua riwayat transaksi belanja Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Riwayat Transaksi</h1>
              <p className="text-muted-foreground mt-1">{filteredCountLabel}</p>
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending_payment">Menunggu Bayar</SelectItem>
                  <SelectItem value="paid">Berhasil</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                  <SelectItem value="expired">Kedaluwarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {rows.length > 0 ? (
            <div
              className="glass-card rounded-xl overflow-hidden animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Pengiriman</TableHead>
                      <TableHead>Resi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((o) => {
                      const orderMeta = orderStatusMeta(o.status);

                      const itemsCount = typeof o.items_count === 'number' ? o.items_count : null;

                      const shipMeta =
                        o.status === 'paid'
                          ? shipmentStatusMeta(o.shipment?.status)
                          : {
                              label: '-',
                              className: 'bg-transparent text-muted-foreground border-transparent',
                            };

                      const tracking = o.shipment?.tracking_number ?? null;
                      const courier = o.shipment?.courier ?? null;

                      return (
                        <TableRow key={o.order_number}>
                          <TableCell className="font-mono text-sm">{o.order_number}</TableCell>

                          <TableCell className="text-sm">{formatDate(o.created_at)}</TableCell>

                          <TableCell>{itemsCount === null ? '-' : `${itemsCount}`} item</TableCell>

                          <TableCell className="font-semibold">
                            {formatPrice(Number(o.total ?? 0))}
                          </TableCell>

                          <TableCell className="capitalize text-sm">
                            {paymentMethodLabel(o.payment?.method)}
                          </TableCell>

                          <TableCell>
                            <Badge className={orderMeta.className}>{orderMeta.label}</Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge className={`${shipmentBadgeBase} ${shipMeta.className}`}>
                                {shipMeta.label}
                              </Badge>

                              {o.shipment?.shipped_at ? (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(o.shipment.shipped_at)}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground whitespace-nowrap opacity-0">
                                  {/* spacer supaya tinggi baris konsisten */}
                                  00 Xxx 0000, 00.00
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {tracking ? (
                              <div className="space-y-1">
                                <div className="font-mono text-sm">{tracking}</div>
                                {courier && (
                                  <div className="text-xs text-muted-foreground">{courier}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {o.status === 'paid' && (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/invoice/${o.order_number}`}>
                                  <FileText className="w-4 h-4 mr-1" />
                                  Invoice
                                </Link>
                              </Button>
                            )}

                            {o.status === 'pending_payment' && (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/payment/confirmation/${o.order_number}`}>Bayar</Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {lastPage > 1 && (
                <div className="flex items-center justify-between gap-3 p-4 border-t border-border/60">
                  <div className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {lastPage}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={loading || currentPage <= 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={loading || currentPage >= lastPage}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Belum ada transaksi</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all'
                  ? 'Tidak ada transaksi dengan filter status tersebut.'
                  : 'Mulai belanja untuk melihat riwayat transaksi'}
              </p>
              <Button asChild>
                <Link to="/products">Mulai Belanja</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default History;
