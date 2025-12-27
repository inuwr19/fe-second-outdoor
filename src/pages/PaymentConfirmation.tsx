import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Copy, Loader2 } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const PaymentConfirmation = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { getTransaction, updateTransactionStatus } = useTransactionStore();
  const { clearCart, items } = useCartStore();
  const { markMultipleAsSold } = useProductStore();
  
  const [countdown, setCountdown] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);

  const transaction = getTransaction(transactionId!);

  useEffect(() => {
    if (!transaction) {
      navigate('/cart');
    }
  }, [transaction, navigate]);

  if (!transaction) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const paymentInstructions = {
    bank_transfer: {
      title: 'Transfer Bank',
      steps: [
        'Buka aplikasi mobile banking atau ATM',
        'Pilih menu Transfer',
        'Masukkan nomor rekening: 1234567890 (BCA)',
        `Transfer sejumlah ${formatPrice(transaction.total)}`,
        'Simpan bukti transfer',
      ],
      account: '1234567890',
      bank: 'BCA - PT Thrift Haven Indonesia',
    },
    e_wallet: {
      title: 'E-Wallet',
      steps: [
        'Buka aplikasi e-wallet pilihan Anda',
        'Scan QR Code atau masukkan nomor',
        `Bayar sejumlah ${formatPrice(transaction.total)}`,
        'Tunggu konfirmasi pembayaran',
      ],
      account: '081234567890',
      bank: 'Thrift Haven',
    },
    cod: {
      title: 'COD (Bayar di Tempat)',
      steps: [
        'Pesanan akan segera diproses',
        'Kurir akan menghubungi Anda',
        'Siapkan uang pas saat kurir tiba',
        'Pembayaran dilakukan saat barang diterima',
      ],
      account: '-',
      bank: '-',
    },
  };

  const instruction = paymentInstructions[transaction.paymentMethod];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Berhasil disalin!');
  };

  const simulatePayment = async (success: boolean) => {
    setIsSimulating(true);
    
    // Simulate payment verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (success) {
      updateTransactionStatus(transaction.id, 'success');
      
      // Mark products as sold
      const productIds = transaction.items.map((item) => item.product.id);
      markMultipleAsSold(productIds);
      
      // Clear cart
      clearCart();
      
      navigate(`/transaction/result?status=success&txnId=${transaction.id}`);
    } else {
      updateTransactionStatus(transaction.id, 'failed');
      navigate(`/transaction/result?status=failed&txnId=${transaction.id}`);
    }
    
    setIsSimulating(false);
  };

  return (
    <>
      <Helmet>
        <title>Konfirmasi Pembayaran - Thrift Haven</title>
        <meta name="description" content="Selesaikan pembayaran Anda sesuai instruksi." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Status Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-warning" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Menunggu Pembayaran
              </h1>
              <p className="text-muted-foreground">
                Selesaikan pembayaran dalam waktu 24 jam
              </p>
            </div>

            {/* Payment Info Card */}
            <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                  <p className="font-display text-2xl font-bold text-primary">
                    {formatPrice(transaction.total)}
                  </p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Pending</Badge>
              </div>

              {transaction.paymentMethod !== 'cod' && (
                <div className="p-4 rounded-lg bg-muted/50 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{instruction.bank}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instruction.account)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Salin
                    </Button>
                  </div>
                  <p className="font-mono text-xl font-bold">{instruction.account}</p>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-4">Cara Pembayaran ({instruction.title})</h3>
                <ol className="space-y-3">
                  {instruction.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center shrink-0 font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Order Details */}
            <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-semibold mb-4">Detail Pesanan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Transaksi</span>
                  <span className="font-mono">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Item</span>
                  <span>{transaction.items.length} item</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Pembayaran</span>
                  <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Simulation Buttons (Demo) */}
            <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo: Simulasi hasil pembayaran
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => simulatePayment(true)}
                  disabled={isSimulating}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  {isSimulating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Sukses
                </Button>
                <Button
                  onClick={() => simulatePayment(false)}
                  disabled={isSimulating}
                  variant="destructive"
                  className="flex-1"
                >
                  {isSimulating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Gagal
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentConfirmation;
