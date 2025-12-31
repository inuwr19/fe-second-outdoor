import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminOrderStore } from '@/stores/adminOrderStore';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminOrderShip() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const { fetchOrder, shipOrder, loading } = useAdminOrderStore();

  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    if (!orderNumber) return;
    (async () => {
      const o = await fetchOrder(orderNumber);
      if (!o) return;

      // prefill kalau sudah ada
      if (o.shipment?.courier) setCourier(o.shipment.courier);
      if (o.shipment?.tracking_number) setTracking(o.shipment.tracking_number);
    })();
  }, [orderNumber, fetchOrder]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;

    if (!tracking.trim()) {
      toast.error('Resi wajib diisi');
      return;
    }

    try {
      await shipOrder(orderNumber, {
        courier: courier.trim() || null,
        tracking_number: tracking.trim(),
      });

      toast.success('Resi berhasil disimpan. Status pengiriman: terkirim.');
      navigate('/admin/orders');
    } catch (err: any) {
      toast.error(err?.message ?? 'Gagal menyimpan resi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Input Resi</h1>
          <p className="text-sm text-muted-foreground">
            Order: <span className="font-semibold">{orderNumber}</span>
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/admin/orders">Kembali</Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Kurir (opsional)</Label>
              <Input
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="JNE / J&T / SiCepat / ..."
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>No. Resi</Label>
              <Input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="JP1234567890"
                className="h-11"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <Button type="submit" disabled={loading} className="rounded-xl">
                {loading ? 'Menyimpan…' : 'Simpan Resi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
