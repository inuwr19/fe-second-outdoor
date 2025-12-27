import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building, Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useProductStore } from '@/stores/productStore';
import { PaymentMethod } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const Payment = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { createTransaction } = useTransactionStore();
  const { markMultipleAsSold } = useProductStore();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const paymentMethods = [
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Transfer Bank',
      description: 'BCA, Mandiri, BNI, BRI',
      icon: Building,
    },
    {
      id: 'e_wallet' as PaymentMethod,
      name: 'E-Wallet',
      description: 'GoPay, OVO, DANA, ShopeePay',
      icon: Wallet,
    },
    {
      id: 'cod' as PaymentMethod,
      name: 'COD',
      description: 'Bayar di tempat',
      icon: CreditCard,
    },
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Create transaction
    const transaction = createTransaction(items, paymentMethod, user.id);
    
    // Navigate to confirmation
    navigate(`/payment/confirmation/${transaction.id}`);
    
    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>Pembayaran - Thrift Haven</title>
        <meta name="description" content="Selesaikan pembayaran untuk pesanan Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Keranjang
          </Button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-8 animate-fade-in">
            Pembayaran
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="glass-card rounded-xl p-6 animate-fade-in">
                <h2 className="font-display text-lg font-semibold mb-4">Alamat Pengiriman</h2>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-sm mt-1">{user.phone}</p>
                  <p className="text-muted-foreground text-sm">{user.address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-display text-lg font-semibold mb-4">Item Pesanan</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size {item.product.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.product.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-display text-lg font-semibold mb-4">Metode Pembayaran</h2>
                
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="font-display text-xl font-semibold mb-6">Ringkasan Pembayaran</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="font-medium text-success">Gratis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPN (11%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
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
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full h-12 mt-6 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    `Bayar ${formatPrice(total)}`
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
