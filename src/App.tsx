import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Index from "./pages/Index";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import ProductDetail from "./pages/ProductDetail";
import ProductList from "./pages/ProductList";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TransactionResult from "./pages/TransactionResult";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/payment/confirmation/:transactionId" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
            <Route path="/transaction/result" element={<ProtectedRoute><TransactionResult /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/invoice/:transactionId" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
