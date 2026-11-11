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
  error: string | null;
  fetchNotificationsAsync: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  error: null,

  fetchNotificationsAsync: async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res && Array.isArray(res.notifications)) {
        set({ notifications: res.notifications, error: null });
      }
    } catch (err: any) {
      set({ error: err?.message || 'Unable to load notifications' });
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
    notificationsApi.markAsRead(id).catch((err: any) => {
      set({ error: err?.message || 'Unable to mark notification as read' });
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    notificationsApi.markAllAsRead().catch((err: any) => {
      set({ error: err?.message || 'Unable to mark all notifications as read' });
    });
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    notificationsApi.deleteNotification(id).catch((err: any) => {
      set({ error: err?.message || 'Unable to delete notification' });
    });
  },

  clearAll: () => {
    set({ notifications: [] });
    notificationsApi.clearAll().catch((err: any) => {
      set({ error: err?.message || 'Unable to clear notifications' });
    });
  },

  reset: () => {
    set({ notifications: [], error: null });
  },
}));
