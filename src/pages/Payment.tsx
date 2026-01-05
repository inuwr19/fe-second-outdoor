import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type CheckoutResponse = {
  order_number: string;
  snap_token?: string;
  order?: any;
};

const Payment = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, updateUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [phone, setPhone] = useState((user?.phone ?? '').toString());
  const [address, setAddress] = useState((user?.address ?? '').toString());
  const [notes, setNotes] = useState('');

  // Redirect side-effects sebaiknya via useEffect, bukan di render
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    // Jika cart kosong "normal" → balik ke cart
    // Tapi kalau sedang submit / sedang redirect → jangan (biar tidak mental balik)
    if (user && items.length === 0 && !isSubmitting && !isRedirecting) {
      navigate('/cart', { replace: true });
    }
  }, [user, items.length, isSubmitting, isRedirecting, navigate]);

  if (!user) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const subtotal = getTotal();
  const shippingFee = 10_000;
  const total = subtotal + shippingFee;

  const canSubmit = useMemo(
    () => phone.trim().length > 0 && address.trim().length > 0,
    [phone, address],
  );

  const handleContinue = async () => {
    if (!canSubmit) {
      toast.error('Nomor HP dan Alamat wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim() ? notes.trim() : null,
      };

      const data = await apiPost<CheckoutResponse>('/checkout', payload);

      const orderNumber = data?.order_number;
      if (!orderNumber) {
        toast.error('Checkout berhasil tetapi order_number tidak ditemukan pada response.');
        return;
      }

      // update store user agar confirmation konsisten
      updateUser({ phone: payload.phone, address: payload.address });

      // penting: set redirect flag dulu, lalu navigate dulu
      setIsRedirecting(true);
      navigate(`/payment/confirmation/${orderNumber}`, { replace: true });

      // clear cart SETELAH navigate agar tidak memicu guard /cart
      setTimeout(() => {
        clearCart();
      }, 0);
    } catch (e: any) {
      toast.error(e?.message ?? 'Gagal melanjutkan checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Data Pengiriman - Second Outdoor</title>
        <meta name="description" content="Lengkapi data pengiriman untuk pesanan Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Keranjang
          </Button>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-8">
            Data Pengiriman
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Data Penerima</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama</Label>
                    <Input value={user.name} disabled className="h-11" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="h-11" />
                  </div>

                  <div className="md:col-span-2">
                    <Label>No. HP</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Alamat</Label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap (jalan, kecamatan, kota, kode pos)"
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Catatan (opsional)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: titip ke satpam / jam pengantaran"
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Ringkasan Pembayaran</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={isSubmitting || !canSubmit}
                  className="w-full h-12 mt-6 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Lanjut ke Konfirmasi'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Payment;
