import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập
 * Nếu chưa đăng nhập -> redirect về /login
 * Nếu đã đăng nhập -> cho phép truy cập
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Chưa đăng nhập -> redirect về login
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập -> cho phép truy cập
  return <>{children}</>;
}