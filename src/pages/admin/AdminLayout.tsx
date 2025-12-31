import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, LogOut, Package } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const { user } = useAuthStore();
  const logout = (useAuthStore() as any).logout as undefined | (() => Promise<void> | void);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
      isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
    ].join(' ');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <Card className="p-4 rounded-2xl h-fit lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <Link to="/admin" className="font-display text-lg font-bold">
                Admin Panel
              </Link>
            </div>

            <div className="text-xs text-muted-foreground mb-4">
              Login sebagai: <span className="font-semibold text-foreground">{user?.name}</span>
            </div>

            <nav className="space-y-2">
              <NavLink to="/admin" end className={navClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>

              <NavLink to="/admin/products" className={navClass}>
                <Package className="w-4 h-4" />
                Produk
              </NavLink>

              <NavLink to="/admin/orders" className={navClass}>
                <Package className="w-4 h-4" />
                Pengiriman
              </NavLink>
            </nav>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (logout) logout();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2">
                Jika tombol logout tidak bekerja, pastikan `authStore` Anda menyediakan method
                `logout()`.
              </p>
            </div>
          </Card>

          {/* Main */}
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
