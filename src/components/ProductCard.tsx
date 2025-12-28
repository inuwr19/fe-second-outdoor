import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types';
import { Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const toTitleCase = (value?: string) => {
  const s = (value ?? '').trim();
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isInCart } = useCartStore();
  const inCart = isInCart(product.id);
  const isSoldOut = product.stock < 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) {
      toast.error('Produk sudah habis terjual');
      return;
    }

    const result = await addToCart(product);

    if (!result.ok) {
      toast.info(result.message ?? 'Gagal menambahkan ke keranjang');
      return;
    }

    toast.success('Berhasil ditambahkan ke keranjang!');
  };


  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const conditionLabel = (product as any).conditionLabel ?? product.condition;

  const conditionColor: Record<string, string> = {
    New: 'bg-secondary text-secondary-foreground',
    'Like New': 'bg-success text-success-foreground',
    Good: 'bg-accent text-accent-foreground',
    Fair: 'bg-muted text-muted-foreground',
  };

  const displayName = toTitleCase(product.name);
  const displayCategory = toTitleCase(product.category);

  return (
    <Link to={`/products/${product.slug}`} className="block focus:outline-none">
      <div
        className={[
          'group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-md',
          'shadow-[0_10px_30px_-26px_rgba(2,16,31,.45)] hover:shadow-[0_18px_60px_-46px_rgba(2,16,31,.65)]',
          'transition-all duration-300 hover:-translate-y-1',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          isSoldOut ? 'opacity-80' : '',
        ].join(' ')}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={displayName || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Condition badge */}
          <Badge
            className={[
              'absolute left-3 top-3',
              conditionColor[conditionLabel] ?? 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {conditionLabel}
          </Badge>

          {/* Sold out */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-background/75 flex items-center justify-center">
              <Badge variant="destructive" className="text-base px-4 py-2">
                Sold Out
              </Badge>
            </div>
          )}

          {/* Quick add */}
          {!isSoldOut && (
            <Button
              onClick={handleAddToCart}
              size="icon"
              aria-label={inCart ? 'Sudah di keranjang' : 'Tambah ke keranjang'}
              className={[
                'absolute bottom-3 right-3 shadow-lg',
                'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                'transition-all duration-300',
                inCart ? 'bg-success hover:bg-success' : '',
              ].join(' ')}
            >
              {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={[
                'text-[15px] sm:text-base font-semibold text-foreground',
                'leading-snug tracking-tight',
                'line-clamp-3 break-words',        // <- 3 baris
                'min-h-[3.9rem]',                  // <- tinggi stabil (≈ 3 baris)
                'group-hover:text-primary transition-colors',
              ].join(' ')}
              title={displayName || product.name}
            >
              {displayName || product.name}
            </h3>

            <Badge variant="outline" className="shrink-0 text-[11px] font-semibold">
              {product.size}
            </Badge>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p
              className="text-xs font-medium text-muted-foreground line-clamp-1"
              title={displayCategory || product.category}
            >
              {displayCategory || product.category}
            </p>

            <p className="text-base sm:text-lg font-bold text-primary tracking-tight">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
