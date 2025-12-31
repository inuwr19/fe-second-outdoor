import { useAuthStore } from '@/stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminGuard() {
  const { user, token } = useAuthStore();

  // belum login
  if (!token || !user) return <Navigate to="/login" replace />;

  // bukan admin
  if ((user as any)?.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
