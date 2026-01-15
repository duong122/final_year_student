// src/components/NotificationBadge.tsx

import { useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';

export default function NotificationBadge() {
  const { unreadCount, loadUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  // Load unread count on mount và poll mỗi 30 giây
  useEffect(() => {
    loadUnreadCount();
    
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Poll mỗi 30 giây

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Notifications"
    >
      <BellIcon className="w-6 h-6" />
      
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}