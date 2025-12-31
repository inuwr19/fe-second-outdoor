import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type AdminOrder = {
  id: number;
  order_number: string;
  status: string; // paid/pending_payment/failed/expired
  total: number;
  created_at: string;
  user?: { id: number; name: string; email: string };
};

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ambil beberapa halaman (maks 3) agar ringkasan lebih representatif
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const collected: AdminOrder[] = [];
        for (let page = 1; page <= 3; page++) {
          const res = await apiGet<Paginator<AdminOrder>>(`/admin/orders?page=${page}`);
          collected.push(...(res.data ?? []));
          if (page >= (res.last_page ?? 1)) break;
        }

        setOrders(collected);
      } catch (e: any) {
        setError(e?.message ?? 'Gagal memuat ringkasan');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'paid');
    const pending = orders.filter((o) => o.status === 'pending_payment');
    const failed = orders.filter((o) => o.status === 'failed' || o.status === 'expired');

    const revenue = paid.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

    return {
      totalOrders: orders.length,
      paidOrders: paid.length,
      pendingOrders: pending.length,
      failedOrders: failed.length,
      revenue,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan dihitung dari order terbaru (hingga 60 order terakhir).
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Revenue Paid</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{loading ? '…' : formatPrice(summary.revenue)}</div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{loading ? '…' : summary.paidOrders}</div>
            <div className="w-10 h-10 rounded-2xl bg-success/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{loading ? '…' : summary.pendingOrders}</div>
            <div className="w-10 h-10 rounded-2xl bg-warning/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Failed / Expired</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{loading ? '…' : summary.failedOrders}</div>
            <div className="w-10 h-10 rounded-2xl bg-destructive/15 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Order Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8">Memuat…</div>
          ) : orders.length ? (
            <div className="space-y-3">
              {orders.slice(0, 8).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.user?.name ?? '—'} • {new Date(o.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">{formatPrice(Number(o.total ?? 0))}</div>
                    <Badge variant="secondary" className="mt-1">
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8">Belum ada data order.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
