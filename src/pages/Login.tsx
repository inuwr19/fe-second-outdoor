import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Thrift Haven</title>
        <meta name="description" content="Login ke Thrift Haven untuk mulai berbelanja pakaian thrift berkualitas." />
      </Helmet>
      
      <div className="min-h-screen flex">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-vintage-brown opacity-90" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
            <ShoppingBag className="w-16 h-16 mb-8" />
            <h1 className="font-display text-5xl font-bold mb-4">
              Thrift Haven
            </h1>
            <p className="text-xl opacity-90 max-w-md">
              Temukan pakaian vintage berkualitas dengan harga terjangkau. 
              Setiap item unik, hanya satu di dunia.
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <span>100% Produk Authentic</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <span>Kurasi Berkualitas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <span>Sustainable Fashion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Selamat Datang
              </h2>
              <p className="mt-2 text-muted-foreground">
                Masuk ke akun Anda untuk mulai berbelanja
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Demo credentials:</p>
              <p className="text-sm font-mono">Email: user@thriftstore.com</p>
              <p className="text-sm font-mono">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
