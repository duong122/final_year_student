// src/components/notifications/NotificationDropdown.tsx

import { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType, type Notification } from '../../types/Notification.types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Import components
import UserProfileModal from '../modals/UserProfileModal';
import CommentModal from '../feed/CommentModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount,
    loading,
    loadNotifications, 
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // ✅ Real-time polling - Unread count mỗi 10 giây
  useEffect(() => {
    loadUnreadCount();
    
    const interval = setInterval(() => {
      loadUnreadCount();
      // Nếu dropdown đang mở, cũng refresh notifications
      if (isOpen) {
        loadNotifications(0);
      }
    }, 10000); // Poll mỗi 10 giây

    return () => clearInterval(interval);
  }, [loadUnreadCount, loadNotifications, isOpen]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications(0);
    }
  }, [isOpen, loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ✅ Fetch post data for CommentModal - Support multiple response formats
  const fetchPostData = async (postId: number) => {
    setIsLoadingPost(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch post:', response.status);
        throw new Error('Failed to fetch post');
      }

      const responseData = await response.json();
      console.log('📦 Post API Response:', responseData);

      // ✅ Handle different response formats
      let postData = responseData;
      
      // If response has {success, data} wrapper
      if (responseData.success && responseData.data) {
        postData = responseData.data;
      }

      // ✅ Transform to CommentModal format
      const transformedPost = {
        id: postData.id?.toString() || postId.toString(),
        author: postData.user?.username || postData.username || 'Unknown',
        avatar: postData.user?.avatarUrl || postData.avatarUrl || '',
        timestamp: postData.createdAt || new Date().toISOString(),
        content: postData.caption || '',
        image: postData.imageUrl || '',
        likes: postData.likeCount || 0,
        comments: postData.commentCount || 0,
        isLiked: postData.likedByCurrentUser || false,
      };

      console.log('✅ Transformed post:', transformedPost);
      return transformedPost;

    } catch (error) {
      console.error('❌ Error fetching post:', error);
      alert('Không thể tải bài viết. Vui lòng thử lại.');
      return null;
    } finally {
      setIsLoadingPost(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    console.log('🔔 Notification clicked:', notification);

    // Đánh dấu là đã đọc
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Mở modal tương ứng
    switch (notification.type) {
      case NotificationType.NEW_FOLLOWER:
        console.log('👤 Opening profile modal for user:', notification.senderId);
        setSelectedUserId(notification.senderId);
        break;
      
      case NotificationType.LIKE_POST:
      case NotificationType.COMMENT_ON_POST:
        console.log('💬 Fetching post:', notification.postId);
        if (notification.postId) {
          const post = await fetchPostData(notification.postId);
          if (post) {
            console.log('✅ Opening comment modal with post:', post);
            setSelectedPost(post);
          } else {
            console.error('❌ Failed to fetch post data');
          }
        } else {
          console.error('❌ No postId in notification');
        }
        break;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Get icon component
  const getIconComponent = (type: NotificationType) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case NotificationType.LIKE_POST:
        return <span className={`${iconClass} text-red-500`}>❤️</span>;
      case NotificationType.COMMENT_ON_POST:
        return <span className={`${iconClass} text-blue-500`}>💬</span>;
      case NotificationType.NEW_FOLLOWER:
        return <span className={`${iconClass} text-green-500`}>👤</span>;
      default:
        return null;
    }
  };

  // Show only first 5 notifications in dropdown
  const displayNotifications = notifications.slice(0, 5);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Icon with Badge */}
        <button
          onClick={() => setIsOpen(!isOpen)}
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

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Thông báo</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await markAllAsRead();
                    await loadUnreadCount();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  <CheckCheckIcon className="w-4 h-4 mr-1" />
                  Đọc tất cả
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có thông báo nào</p>
                </div>
              ) : (
                displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage 
                          src={notification.senderAvatarUrl || ''} 
                          alt={notification.senderUsername} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {notification.senderFullName?.charAt(0) || notification.senderUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                          <span className="font-semibold">{notification.senderUsername}</span>{' '}
                          {notification.message.replace(notification.senderUsername, '').trim()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Thumbnail or Icon */}
                      <div className="flex-shrink-0">
                        {notification.postImageUrl ? (
                          <img 
                            src={notification.postImageUrl} 
                            alt="Post"
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          getIconComponent(notification.type)
                        )}
                      </div>

                      {/* Unread dot */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer - View All */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUserId !== null && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={true}
          onClose={() => {
            console.log('🔒 Closing profile modal');
            setSelectedUserId(null);
          }}
        />
      )}

      {selectedPost !== null && (
        <CommentModal
          post={selectedPost}
          isOpen={true}
          onClose={() => {
            console.log('🔒 Closing comment modal');
            setSelectedPost(null);
          }}
        />
      )}

      {/* Loading overlay */}
      {isLoadingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      )}
    </>
  );
}