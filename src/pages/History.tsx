import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Filter, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { TransactionStatus } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Helmet } from 'react-helmet-async';

const History = () => {
  const { user } = useAuthStore();
  const { getUserTransactions } = useTransactionStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const transactions = user ? getUserTransactions(user.id) : [];
  
  const filteredTransactions = statusFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const statusColors: Record<TransactionStatus, string> = {
    pending: 'bg-warning text-warning-foreground',
    processing: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    failed: 'bg-destructive text-destructive-foreground',
  };

  const statusLabels: Record<TransactionStatus, string> = {
    pending: 'Menunggu',
    processing: 'Diproses',
    success: 'Berhasil',
    failed: 'Gagal',
  };

  return (
    <>
      <Helmet>
        <title>Riwayat Transaksi - Thrift Haven</title>
        <meta name="description" content="Lihat semua riwayat transaksi belanja Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Riwayat Transaksi
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredTransactions.length} transaksi
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="success">Berhasil</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          {transaction.items.length} item
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(transaction.total)}
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[transaction.status]}>
                            {statusLabels[transaction.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.status === 'success' && (
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/invoice/${transaction.id}`}>
                                <FileText className="w-4 h-4 mr-1" />
                                Invoice
                              </Link>
                            </Button>
                          )}
                          {transaction.status === 'pending' && (
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/payment/confirmation/${transaction.id}`}>
                                Bayar
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Belum ada transaksi
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' 
                  ? `Tidak ada transaksi dengan status "${statusLabels[statusFilter as TransactionStatus]}"`
                  : 'Mulai belanja untuk melihat riwayat transaksi'}
              </p>
              <Button asChild>
                <Link to="/products">Mulai Belanja</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default History;
