import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute - Bảo vệ các route công khai như Login, Register
 * Nếu đã đăng nhập -> redirect về /home
 * Nếu chưa đăng nhập -> cho phép truy cập login/register
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    // Đã đăng nhập -> không cho vào trang login nữa, redirect về home
    return <Navigate to="/home" replace />;
  }

  // Chưa đăng nhập -> cho phép truy cập login/register
  return <>{children}</>;
}