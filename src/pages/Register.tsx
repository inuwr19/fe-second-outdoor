import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
        // We could also set a local error here if we wanted, but API validates too
        // For better UX, let's catch it early if possible, but store handles error state
    }

    const success = await register(name, email, password, confirmPassword);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Daftar - Second Outdoor</title>
        <meta name="description" content="Daftar akun baru di Second Outdoor untuk mulai berbelanja pakaian thrift berkualitas." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-vintage-sage opacity-90" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-secondary-foreground">
            <ShoppingBag className="w-16 h-16 mb-8 text-white" />
            <h1 className="font-display text-5xl font-bold mb-4 text-white">
              Gabung Komunitas
            </h1>
            <p className="text-xl opacity-90 max-w-md text-white/90">
              Mulai perjalanan fashion berkelanjutan Anda bersama ribuan member lainnya.
            </p>
            <div className="mt-12 space-y-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Akses Koleksi Terbaru</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Gratis Ongkir Member Baru</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>Promo Eksklusif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Buat Akun Baru
              </h2>
              <p className="mt-2 text-muted-foreground">
                Lengkapi data diri Anda untuk mendaftar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

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
                    placeholder="Minimal 8 karakter"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Login disini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
