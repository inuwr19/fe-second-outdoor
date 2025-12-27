import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isInCart } = useCartStore();
  const inCart = isInCart(product.id);
  const isSoldOut = product.stock < 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSoldOut) {
      toast.error('Produk sudah habis terjual');
      return;
    }
    
    if (inCart) {
      toast.info('Produk sudah ada di keranjang');
      return;
    }
    
    const success = addToCart(product);
    if (success) {
      toast.success('Berhasil ditambahkan ke keranjang!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const conditionColor = {
    'Like New': 'bg-success text-success-foreground',
    'Excellent': 'bg-secondary text-secondary-foreground',
    'Good': 'bg-accent text-accent-foreground',
    'Fair': 'bg-muted text-muted-foreground',
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className={`group glass-card rounded-xl overflow-hidden hover-lift ${isSoldOut ? 'opacity-75' : ''}`}>
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                SOLD OUT
              </Badge>
            </div>
          )}
          
          {/* Quick Add Button */}
          {!isSoldOut && (
            <Button
              onClick={handleAddToCart}
              size="icon"
              className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
                inCart ? 'bg-success hover:bg-success' : ''
              }`}
            >
              {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </Button>
          )}
          
          {/* Condition Badge */}
          <Badge 
            className={`absolute top-3 left-3 ${conditionColor[product.condition]}`}
          >
            {product.condition}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <Badge variant="outline" className="shrink-0">
              {product.size}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{product.category}</p>
          
          <p className="font-display text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
};
