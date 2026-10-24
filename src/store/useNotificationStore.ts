import { create } from 'zustand';
import { notificationsApi } from '../api';

export type NotificationCategory = 'ORDER' | 'SURGE' | 'SHIFT' | 'PAYOUT' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  amount?: string;
  actionRoute?: string;
  actionLabel?: string;
  orderId?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  fetchNotificationsAsync: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  fetchNotificationsAsync: async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res && Array.isArray(res.notifications)) {
        set({ notifications: res.notifications });
      }
    } catch {
      // Retain existing state if offline
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
    notificationsApi.markAsRead(id).catch(() => {});
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    notificationsApi.markAllAsRead().catch(() => {});
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    notificationsApi.deleteNotification(id).catch(() => {});
  },

  clearAll: () => {
    set({ notifications: [] });
    notificationsApi.clearAll().catch(() => {});
  },
}));
