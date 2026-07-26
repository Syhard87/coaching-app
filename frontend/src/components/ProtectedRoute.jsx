import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { coach, loading } = useAuth();

  if (loading) return null;
  if (!coach) return <Navigate to="/login" replace />;
  return <Outlet />;
}
