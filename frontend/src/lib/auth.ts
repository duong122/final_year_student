

export const authUtils = {
  // Lưu tokens sau khi login
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Lấy access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Lấy refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  // Xóa tất cả tokens (khi logout)
  clearTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Lưu user info
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Lấy user info
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra có đăng nhập chưa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};