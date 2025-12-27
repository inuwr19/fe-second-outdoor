import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useProductStore } from '@/stores/productStore';
import { 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Package,
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getUserTransactions } = useTransactionStore();
  const { products } = useProductStore();

  const userTransactions = user ? getUserTransactions(user.id) : [];
  const recentTransactions = userTransactions.slice(-5).reverse();

  const stats = {
    totalOrders: userTransactions.length,
    pendingOrders: userTransactions.filter((t) => t.status === 'pending').length,
    successOrders: userTransactions.filter((t) => t.status === 'success').length,
    totalSpent: userTransactions
      .filter((t) => t.status === 'success')
      .reduce((sum, t) => sum + t.total, 0),
  };

  const availableProducts = products.filter((p) => p.stock > 0).length;

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
    }).format(new Date(date));
  };

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    processing: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    failed: 'bg-destructive text-destructive-foreground',
  };

  const statusLabels = {
    pending: 'Menunggu',
    processing: 'Diproses',
    success: 'Berhasil',
    failed: 'Gagal',
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Thrift Haven</title>
        <meta name="description" content="Kelola pesanan dan lihat ringkasan aktivitas belanja Anda di Thrift Haven." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Selamat Datang, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Berikut ringkasan aktivitas belanja Anda
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Pesanan</p>
                    <p className="font-display text-3xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Menunggu Bayar</p>
                    <p className="font-display text-3xl font-bold">{stats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Berhasil</p>
                    <p className="font-display text-3xl font-bold">{stats.successOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Belanja</p>
                    <p className="font-display text-xl font-bold">{formatPrice(stats.totalSpent)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display">Transaksi Terbaru</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/history">
                      Lihat Semua
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(transaction.total)}</p>
                            <Badge className={statusColors[transaction.status]}>
                              {statusLabels[transaction.status]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Belum ada transaksi</p>
                      <Button asChild className="mt-4">
                        <Link to="/products">Mulai Belanja</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle className="font-display">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/products">
                      <ShoppingBag className="w-4 h-4 mr-3" />
                      Belanja Sekarang
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/history">
                      <Clock className="w-4 h-4 mr-3" />
                      Riwayat Transaksi
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/profile">
                      <TrendingUp className="w-4 h-4 mr-3" />
                      Edit Profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="font-display text-2xl font-bold">{availableProducts}</p>
                    <p className="text-sm text-muted-foreground">Produk Tersedia</p>
                    <Button asChild variant="secondary" className="mt-4">
                      <Link to="/products">Lihat Koleksi</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
