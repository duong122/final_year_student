import { Navigate } from 'react-router-dom';

/**
 * RootRedirect - Xử lý route gốc "/"
 * Nếu đã đăng nhập -> redirect về /home
 * Nếu chưa đăng nhập -> redirect về /login
 */
export default function RootRedirect() {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    // Đã đăng nhập -> vào trang home
    return <Navigate to="/home" replace />;
  }

  // Chưa đăng nhập -> vào trang login
  return <Navigate to="/login" replace />;
}