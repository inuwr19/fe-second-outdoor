import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, FileText } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const TransactionResult = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const txnId = searchParams.get('txnId');
  const { getTransaction } = useTransactionStore();

  const transaction = txnId ? getTransaction(txnId) : null;
  const isSuccess = status === 'success';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>{isSuccess ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'} - Thrift Haven</title>
        <meta name="description" content={isSuccess ? 'Pembayaran Anda berhasil diproses.' : 'Pembayaran Anda gagal.'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            {/* Status Icon */}
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-scale-in ${
              isSuccess ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>

            {/* Status Text */}
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 animate-fade-in">
              {isSuccess ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal'}
            </h1>
            <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {isSuccess
                ? 'Terima kasih! Pesanan Anda sedang diproses.'
                : 'Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.'}
            </p>

            {/* Transaction Details */}
            {transaction && isSuccess && (
              <div className="glass-card rounded-xl p-6 mb-8 text-left animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-semibold mb-4 text-center">Detail Transaksi</h3>
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
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-primary">{formatPrice(transaction.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {isSuccess && transaction && (
                <Button asChild className="w-full h-12">
                  <Link to={`/invoice/${transaction.id}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Link>
                </Button>
              )}
              
              <Button asChild variant={isSuccess ? 'outline' : 'default'} className="w-full h-12">
                <Link to="/products">
                  {isSuccess ? 'Lanjut Belanja' : 'Coba Lagi'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              {isSuccess && (
                <Button asChild variant="ghost" className="w-full h-12">
                  <Link to="/history">
                    Lihat Riwayat Transaksi
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TransactionResult;
