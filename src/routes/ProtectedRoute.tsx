import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  forbidAdmin?: boolean;
}

export default function ProtectedRoute({ children, forbidAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-20 text-center text-[#3B82F6] font-bold">正在认证身份...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (forbidAdmin && isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
