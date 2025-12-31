import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminOrderStore } from '@/stores/adminOrderStore';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function AdminOrders() {
  const { orders, loading, error, currentPage, lastPage, fetchOrders } = useAdminOrderStore();

  useEffect(() => {
    fetchOrders({ page: 1, status: 'paid' });
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Pengiriman</h1>
          <p className="text-sm text-muted-foreground">
            Menampilkan order berstatus <span className="font-semibold">PAID</span> untuk diproses
            pengiriman.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Daftar Order</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Memuat…</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Tidak ada order paid.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const shipped =
                  Boolean(o.shipment?.tracking_number) &&
                  (o.shipment?.status === 'shipped' || o.shipment?.status === 'delivered');

                return (
                  <div
                    key={o.order_number}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/60 p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{o.order_number}</p>
                        <Badge variant="secondary">{formatPrice(o.total)}</Badge>
                        {shipped ? (
                          <Badge className="bg-success text-success-foreground">Terkirim</Badge>
                        ) : (
                          <Badge className="bg-warning text-warning-foreground">
                            Belum dikirim
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {o.user?.name} • {o.user?.email}
                      </p>
                      {o.shipment?.tracking_number && (
                        <p className="text-sm">
                          Resi: <span className="font-semibold">{o.shipment.tracking_number}</span>
                          {o.shipment.courier ? ` • ${o.shipment.courier}` : null}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!shipped && (
                        <Button asChild variant="outline" className="rounded-xl">
                          <Link to={`/admin/orders/${o.order_number}/ship`}>Isi Resi</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination sederhana */}
          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={currentPage === 1}
                onClick={() => fetchOrders({ page: Math.max(1, currentPage - 1), status: 'paid' })}
              >
                Sebelumnya
              </Button>
              <Badge variant="secondary">
                Halaman {currentPage} / {lastPage}
              </Badge>
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={currentPage === lastPage}
                onClick={() =>
                  fetchOrders({ page: Math.min(lastPage, currentPage + 1), status: 'paid' })
                }
              >
                Berikutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
