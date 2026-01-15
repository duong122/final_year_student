// src/lib/notificationApi.service.ts

import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
} from '../types/Notification.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class NotificationApiService {
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * GET /api/notifications - Lấy danh sách notifications
   */
  async getNotifications(page: number = 0, size: number = 20): Promise<NotificationsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * GET /api/notifications/unread-count - Lấy số lượng notifications chưa đọc
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * PUT /api/notifications/{id}/read - Đánh dấu một notification đã đọc
   */
  async markAsRead(notificationId: number): Promise<MarkAsReadResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * PUT /api/notifications/read-all - Đánh dấu tất cả notifications đã đọc
   */
  async markAllAsRead(): Promise<MarkAsReadResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
export default notificationApiService;