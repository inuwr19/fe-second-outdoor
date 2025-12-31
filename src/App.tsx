import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import About from './pages/About';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Index from './pages/Index';
import Invoice from './pages/Invoice';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Payment from './pages/Payment';
import PaymentConfirmation from './pages/PaymentConfirmation';
import ProductDetail from './pages/ProductDetail';
import ProductList from './pages/ProductList';
import Profile from './pages/Profile';
import Register from './pages/Register';
import TransactionResult from './pages/TransactionResult';

// Admin
import AdminGuard from './components/admin/AdminGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderShip from './pages/admin/AdminOrderShip';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminProducts from './pages/admin/AdminProducts';

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetail />} />

            {/* Customer protected */}
            <Route path="/cart" element={<Cart />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />

            <Route path="/payment/confirmation/:orderNumber" element={<PaymentConfirmation />} />
            <Route path="/invoice/:orderNumber" element={<Invoice />} />

            <Route
              path="/transaction/result"
              element={
                <ProtectedRoute>
                  <TransactionResult />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin protected (HARUS di dalam Routes) */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm mode="create" />} />
                <Route path="products/:id/edit" element={<AdminProductForm mode="edit" />} />

                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderNumber/ship" element={<AdminOrderShip />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
