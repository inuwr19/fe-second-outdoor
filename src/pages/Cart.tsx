import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, getTotal } = useCartStore();
  const { user } = useAuthStore();

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} dihapus dari keranjang`);
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    navigate('/payment');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = getTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Keranjang Belanja - Second Outdoor</title>
        <meta name="description" content="Lihat dan kelola item di keranjang belanja Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8 animate-fade-in">
            Keranjang Belanja
          </h1>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="glass-card rounded-xl p-4 flex gap-4 animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {/* Image */}
                    <Link to={`/products/${item.product.id}`} className="shrink-0">
                      <div className="w-24 h-32 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.product.category} • Size {item.product.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.product.id, item.product.name)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mt-auto flex items-end justify-between">
                        {/* Quantity (fixed at 1 for thrift) */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Qty:</span>
                          <div className="flex items-center gap-1 glass-card rounded-lg px-3 py-1">
                            <span className="font-medium w-8 text-center">1</span>
                          </div>
                          <span className="text-xs text-muted-foreground">(Max 1)</span>
                        </div>

                        <p className="font-display text-lg font-semibold text-primary">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-xl p-6 sticky top-24 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h2 className="font-display text-xl font-semibold mb-6">Ringkasan Pesanan</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      <span className="font-medium text-success">Gratis</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-display text-xl font-bold text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 mt-6 text-base"
                  >
                    Lanjut ke Pembayaran
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-xs text-muted-foreground text-center">
                      🌿 Terima kasih telah mendukung sustainable fashion!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Keranjang Kosong</h2>
              <p className="text-muted-foreground mb-6">
                Belum ada item di keranjang Anda
              </p>
              <Button asChild size="lg">
                <Link to="/products">
                  Mulai Belanja
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Cart;
