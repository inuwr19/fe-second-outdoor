import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { ArrowLeft, Check, Heart, Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { fetchProductBySlug, getProductBySlug, loading, error } = useProductStore();
  const { addToCart, isInCart } = useCartStore();

  useEffect(() => {
    if (slug) fetchProductBySlug(slug);
  }, [slug, fetchProductBySlug]);

  const product = useMemo(() => (slug ? getProductBySlug(slug) : undefined), [slug, getProductBySlug]);

  const inCart = product ? isInCart(product.id) : false;
  const isSoldOut = product ? product.stock < 1 : false;

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Memuat detail produk...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Produk tidak ditemukan</h1>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <Button onClick={() => navigate('/products')}>Kembali ke Koleksi</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isSoldOut) {
      toast.error('Produk sudah habis terjual');
      return;
    }

    if (inCart) {
      toast.info('Produk sudah ada di keranjang');
      return;
    }

    const success = addToCart(product);
    if (success) toast.success('Berhasil ditambahkan ke keranjang!');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  // gunakan label condition yang konsisten
  const conditionLabel = (product as any).conditionLabel ?? product.condition;

  const conditionColor: Record<string, string> = {
    New: 'bg-secondary text-secondary-foreground',
    'Like New': 'bg-success text-success-foreground',
    Good: 'bg-accent text-accent-foreground',
    Fair: 'bg-muted text-muted-foreground',
  };

  const conditionDesc: Record<string, string> = {
    New: 'Kondisi baru, minim/nihil tanda pemakaian',
    'Like New': 'Kondisi seperti baru, hampir tidak ada tanda pemakaian',
    Good: 'Kondisi baik dengan tanda pemakaian wajar',
    Fair: 'Kondisi cukup dengan beberapa tanda pemakaian terlihat',
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - Second Outdoor</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-in">
            <Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden glass-card ${isSoldOut ? 'opacity-75' : ''}`}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />

                {isSoldOut && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Badge variant="destructive" className="text-2xl px-8 py-4">
                      SOLD OUT
                    </Badge>
                  </div>
                )}

                <Badge className={`absolute top-4 left-4 ${conditionColor[conditionLabel] ?? 'bg-muted text-muted-foreground'}`}>
                  {conditionLabel}
                </Badge>
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="sticky top-24">
                <Badge variant="outline" className="mb-4">
                  {product.category}
                </Badge>

                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>

                <p className="font-display text-3xl font-bold text-primary mb-6">
                  {formatPrice(product.price)}
                </p>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {product.description}
                </p>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Size</p>
                    <p className="font-semibold">{product.size}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Kondisi</p>
                    <p className="font-semibold">{conditionLabel}</p>
                  </div>
                </div>

                <div className="glass-card rounded-lg p-4 mb-8">
                  <p className="text-sm font-medium mb-1">Tentang Kondisi</p>
                  <p className="text-sm text-muted-foreground">
                    {conditionDesc[conditionLabel] ?? 'Kondisi produk thrift.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-8">
                  <div className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-destructive' : 'bg-success'}`} />
                  <span className="text-sm">
                    {isSoldOut ? 'Stok habis' : 'Stok tersedia'}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    size="lg"
                    className={`flex-1 h-14 text-base ${inCart ? 'bg-success hover:bg-success' : ''}`}
                  >
                    {isSoldOut ? (
                      'Sold Out'
                    ) : inCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Sudah di Keranjang
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Tambah ke Keranjang
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="lg" className="h-14">
                    <Heart className="w-5 h-5" />
                  </Button>

                  <Button variant="outline" size="lg" className="h-14">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductDetail;
