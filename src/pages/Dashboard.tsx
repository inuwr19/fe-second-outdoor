import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productStore';
import { useTransactionStore } from '@/stores/transactionStore';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    processing: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    failed: 'bg-destructive text-destructive-foreground',
  } as const;

  const statusLabels = {
    pending: 'Menunggu',
    processing: 'Diproses',
    success: 'Berhasil',
    failed: 'Gagal',
  } as const;

  // Mock data for the chart (simulating monthly spending)
  const chartData = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 450000 },
    { name: 'Mar', total: 150000 },
    { name: 'Apr', total: 980000 },
    { name: 'May', total: stats.totalSpent > 1000000 ? stats.totalSpent - 600000 : 350000 },
    { name: 'Jun', total: stats.totalSpent },
  ];

  return (
  <>
    <Helmet>
      <title>Dashboard - Second Outdoor</title>
      <meta
        name="description"
        content="Kelola pesanan dan lihat ringkasan aktivitas belanja Anda di Second Outdoor."
      />
    </Helmet>

    {/* Background seperti gambar + OUTER PADDING */}
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 ai-grid-bg p-6 sm:p-10 lg:p-16">
        <div className="mx-auto w-full max-w-7xl">
          {/* Panel besar rounded */}
          <div className="ai-shell p-8 sm:p-12 lg:p-16 mb-12">
            {/* Welcome Section */}
            <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2 leading-tight">
                  Selamat Datang, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  Lihat perkembangan belanja dan kelola pesanan Anda.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/products">
                  Mulai Belanja
                  <ShoppingBag className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10">
              <Card
                className="glass-card hover-lift animate-fade-in rounded-3xl"
                style={{ animationDelay: "0.1s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Pesanan</p>
                      <p className="font-display text-3xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-card hover-lift animate-fade-in rounded-3xl"
                style={{ animationDelay: "0.2s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Menunggu Bayar</p>
                      <p className="font-display text-3xl font-bold">{stats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-warning/15 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-card hover-lift animate-fade-in rounded-3xl"
                style={{ animationDelay: "0.3s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Berhasil</p>
                      <p className="font-display text-3xl font-bold">{stats.successOrders}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-card hover-lift animate-fade-in rounded-3xl"
                style={{ animationDelay: "0.4s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Belanja</p>
                      <p className="font-display text-xl font-bold truncate" title={formatPrice(stats.totalSpent)}>{formatPrice(stats.totalSpent)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Spending Chart */}
                <Card className="glass-card animate-fade-in rounded-3xl" style={{ animationDelay: "0.5s" }}>
                  <CardHeader>
                    <CardTitle className="font-display">Pengeluaran Bulanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            dy={10}
                          />
                          <YAxis
                            hide
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="glass-card animate-fade-in rounded-3xl" style={{ animationDelay: "0.6s" }}>
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
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/45 hover:bg-white/60 transition-colors border border-white/50 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Order #{transaction.id.slice(0, 8)}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{transaction.items.length} item</span>
                                  <span>•</span>
                                  <span>{formatDate(transaction.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(transaction.total)}</p>
                              <Badge className={`mt-1 ${statusColors[transaction.status]}`}>
                                {statusLabels[transaction.status]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Belum ada transaksi</p>
                        <Button asChild>
                          <Link to="/products">Mulai Belanja</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar / Quick Actions */}
              <div className="space-y-6">
                <Card className="glass-card animate-fade-in rounded-3xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground border-none" style={{ animationDelay: "0.7s" }}>
                  <CardContent className="p-8">
                    <h3 className="font-display text-2xl font-bold mb-2">Member Premium</h3>
                    <p className="text-primary-foreground/80 mb-6">
                      Nikmati gratis ongkir dan akses lebih awal ke koleksi terbaru.
                    </p>
                    <Button variant="secondary" className="w-full text-primary rounded-xl font-bold">
                      Upgrade Sekarang
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card animate-fade-in rounded-3xl" style={{ animationDelay: "0.8s" }}>
                  <CardHeader>
                    <CardTitle className="font-display">Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-start h-12 text-base" variant="outline">
                      <Link to="/products">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        Belanja Sekarang
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start h-12 text-base" variant="outline">
                      <Link to="/history">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center mr-3">
                          <Clock className="w-4 h-4 text-warning" />
                        </div>
                        Riwayat Transaksi
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start h-12 text-base" variant="outline">
                      <Link to="/profile">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center mr-3">
                          <CreditCard className="w-4 h-4 text-secondary" />
                        </div>
                        Metode Pembayaran
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

};

export default Dashboard;
