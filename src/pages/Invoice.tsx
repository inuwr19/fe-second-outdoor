import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

const Invoice = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { generateInvoice } = useTransactionStore();
  const { user } = useAuthStore();

  if (!user || !transactionId) {
    navigate('/');
    return null;
  }

  const invoice = generateInvoice(transactionId, user);

  if (!invoice) {
    return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 text-center"><p>Invoice tidak ditemukan</p></main></div>;
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (date: Date) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));

  return (
    <>
      <Helmet><title>Invoice {invoice.invoiceNumber} - Second Outdoor</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="print:hidden"><Navbar /></div>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="print:hidden flex gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Kembali</Button>
            <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Cetak</Button>
          </div>
          <div className="bg-card rounded-xl p-8 shadow-lg print:shadow-none">
            <div className="flex justify-between items-start mb-8">
              <div><h1 className="font-display text-2xl font-bold text-primary">Second Outdoor</h1><p className="text-sm text-muted-foreground">Sustainable Fashion Store</p></div>
              <div className="text-right"><p className="font-mono text-lg font-bold">{invoice.invoiceNumber}</p><p className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</p></div>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div><h3 className="font-semibold mb-2">Tagihan Kepada</h3><p>{invoice.user.name}</p><p className="text-sm text-muted-foreground">{invoice.user.email}</p><p className="text-sm text-muted-foreground">{invoice.user.phone}</p><p className="text-sm text-muted-foreground">{invoice.user.address}</p></div>
              <div className="text-right"><h3 className="font-semibold mb-2">Status</h3><span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">LUNAS</span></div>
            </div>
            <table className="w-full mb-8"><thead><tr className="border-b"><th className="text-left py-3">Produk</th><th className="text-center py-3">Qty</th><th className="text-right py-3">Harga</th></tr></thead><tbody>{invoice.items.map((item) => (<tr key={item.product.id} className="border-b"><td className="py-3">{item.product.name}<br /><span className="text-sm text-muted-foreground">Size: {item.product.size}</span></td><td className="text-center py-3">{item.quantity}</td><td className="text-right py-3">{formatPrice(item.product.price)}</td></tr>))}</tbody></table>
            <div className="flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(invoice.subtotal)}</span></div><div className="flex justify-between"><span>PPN (11%)</span><span>{formatPrice(invoice.tax)}</span></div><Separator /><div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{formatPrice(invoice.total)}</span></div></div></div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground"><p>Terima kasih telah berbelanja di Second Outdoor! 🌿</p></div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Invoice;
