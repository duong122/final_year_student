// src/types/notification.types.ts

export interface Notification {
  id: number;
  recipientId: number;
  senderId: number;
  senderUsername: string;
  senderFullName: string;
  senderAvatarUrl: string | null;
  type: NotificationType;
  postId: number | null;
  postImageUrl: string | null;
  isRead: boolean;
  createdAt: string;
  message: string;
}

export const NotificationType = {
  LIKE_POST: 'LIKE_POST',
  COMMENT_ON_POST: 'COMMENT_ON_POST',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    content: Notification[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data?: {
    updatedCount: number;
  };
}