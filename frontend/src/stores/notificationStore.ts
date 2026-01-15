// src/stores/notificationStore.ts

import { create } from 'zustand';
import notificationApiService from '../lib/notificationApi.service';
import type { Notification } from '../types/Notification.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

interface NotificationActions {
  loadNotifications: (page?: number) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,

  // Load notifications
  loadNotifications: async (page = 0) => {
    set({ loading: true, error: null });

    try {
      const response = await notificationApiService.getNotifications(page, 20);

      if (response.success && response.data) {
        set((state) => ({
          notifications: page === 0 
            ? response.data.content 
            : [...state.notifications, ...response.data.content],
          hasMore: !response.data.last,
          currentPage: page,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      set({ 
        error: 'Không thể tải thông báo', 
        loading: false 
      });
    }
  },

  // Load unread count
  loadUnreadCount: async () => {
    try {
      const response = await notificationApiService.getUnreadCount();

      if (response.success && response.data) {
        set({ unreadCount: response.data.unreadCount });
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId: number) => {
    try {
      const response = await notificationApiService.markAsRead(notificationId);

      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId
              ? { ...notif, isRead: true }
              : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await notificationApiService.markAllAsRead();

      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // Reset state
  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      hasMore: true,
      currentPage: 0,
    });
  },
}));