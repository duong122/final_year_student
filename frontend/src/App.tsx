import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { useChatStore } from './stores/chatStore';

// Import Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRouteProps';
import RootRedirect from './components/auth/RootRedirect';

// Import Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from  './pages/Register';
import UserProfilePage from './pages/Userprofilepage';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      useChatStore.getState().loadCurrentUser();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Root Route - Auto redirect dựa trên auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes - Chỉ truy cập khi CHƯA đăng nhập */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* ← Thêm route Register */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Chỉ truy cập khi ĐÃ đăng nhập */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 - Redirect về root */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;