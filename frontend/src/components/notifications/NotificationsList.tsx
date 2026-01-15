// src/components/notifications/NotificationsList.tsx

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { HeartIcon, MessageCircleIcon, UserPlusIcon, CheckCheckIcon } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType, type Notification } from '../../types/Notification.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Post } from '../../types/post'; // ✅ Import shared type

// Import components
import UserProfileModal from '../modals/UserProfileModal';
import CommentModal from '../feed/CommentModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ API response type
interface PostApiResponse {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl: string | null;
  caption: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsList() {
  const { 
    notifications, 
    loading, 
    error,
    loadNotifications, 
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // ✅ Dùng Post type
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false); // ✅ Explicit modal state
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // ✅ Real-time polling - Load notifications mỗi 10 giây
  useEffect(() => {
    loadNotifications(0);
    loadUnreadCount();

    const interval = setInterval(() => {
      loadNotifications(0);
      loadUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadNotifications, loadUnreadCount]);

  // ✅ Fetch post data - Transform to Post type
  const fetchPostData = async (postId: number): Promise<Post | null> => {
    setIsLoadingPost(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('🔍 Fetching post:', postId);
      
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch post:', response.status);
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📦 Post API Response:', responseData);

      // ✅ Handle different response formats
      let apiPost: PostApiResponse;
      
      if (responseData.success && responseData.data) {
        apiPost = responseData.data;
      } else {
        apiPost = responseData;
      }

      // ✅ Transform to Post type
      const transformedPost: Post = {
        id: apiPost.id,
        userId: apiPost.userId,
        username: apiPost.username,
        userFullName: apiPost.userFullName,
        userAvatarUrl: apiPost.userAvatarUrl,
        caption: apiPost.caption,
        imageUrl: apiPost.imageUrl,
        likeCount: apiPost.likeCount,
        commentCount: apiPost.commentCount,
        isSaved: apiPost.isSaved,
        isLikedByCurrentUser: apiPost.isLikedByCurrentUser,
        createdAt: apiPost.createdAt,
        updatedAt: apiPost.updatedAt,
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

    // Mở modal tương ứng với type
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
            setIsCommentModalOpen(true); // ✅ Explicit open
          } else {
            console.error('❌ Failed to fetch post data');
          }
        } else {
          console.error('❌ No postId in notification');
        }
        break;
    }
  };

  // ✅ Close comment modal handler
  const handleCloseCommentModal = () => {
    console.log('🔒 Closing comment modal');
    setIsCommentModalOpen(false);
    setSelectedPost(null);
  };

  // ✅ Update comment count
  const handleCommentCountUpdate = (newCount: number) => {
    if (selectedPost) {
      setSelectedPost(prev => prev ? { ...prev, commentCount: newCount } : null);
    }
  };

  // Get icon based on notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE_POST:
        return HeartIcon;
      case NotificationType.COMMENT_ON_POST:
        return MessageCircleIcon;
      case NotificationType.NEW_FOLLOWER:
        return UserPlusIcon;
      default:
        return MessageCircleIcon;
    }
  };

  // Get icon color based on notification type
  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE_POST:
        return 'text-red-500';
      case NotificationType.COMMENT_ON_POST:
        return 'text-blue-500';
      case NotificationType.NEW_FOLLOWER:
        return 'text-green-500';
      default:
        return 'text-gray-500';
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

  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => loadNotifications(0)}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-2">Chưa có thông báo nào</p>
          <p className="text-sm text-muted-foreground">
            Các thông báo về lượt thích, bình luận và người theo dõi mới sẽ xuất hiện ở đây
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center px-4">
        {notifications.some(n => !n.isRead) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80"
          >
            <CheckCheckIcon className="w-4 h-4 mr-2" />
            Đánh dấu tất cả là đã đọc
          </Button>
        )}
      </div>

      <Card className="divide-y divide-border bg-card text-card-foreground border-border">
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const iconColor = getIconColor(notification.type);
          
          return (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-6 transition-colors duration-200 cursor-pointer ${
                !notification.isRead 
                  ? 'bg-blue-50 hover:bg-blue-100' 
                  : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage 
                    src={notification.senderAvatarUrl || ''} 
                    alt={notification.senderUsername} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {notification.senderFullName?.charAt(0) || notification.senderUsername.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-foreground ${!notification.isRead ? 'font-semibold' : ''}`}>
                    <span className="font-semibold">{notification.senderUsername}</span>{' '}
                    {notification.message.replace(notification.senderUsername, '').trim()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Icon or Post Thumbnail */}
                <div className="flex-shrink-0">
                  {notification.postImageUrl ? (
                    <img 
                      src={notification.postImageUrl} 
                      alt="Post"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  )}
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      {/* User Profile Modal */}
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

      {/* ✅ Comment Modal - Fixed */}
      {selectedPost && (
        <CommentModal
          post={selectedPost}
          isOpen={isCommentModalOpen}
          onClose={handleCloseCommentModal}
          onCommentCountUpdate={handleCommentCountUpdate}
        />
      )}

      {/* Loading overlay khi fetch post */}
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