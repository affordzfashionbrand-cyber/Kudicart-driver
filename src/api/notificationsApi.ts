import { request } from './client';
import { NotificationItem } from '../store/useNotificationStore';

export interface NotificationsResponse {
  unreadCount: number;
  notifications: NotificationItem[];
}

export const notificationsApi = {
  getNotifications: async (category?: string): Promise<NotificationsResponse> => {
    const query = category ? `?category=${category}` : '';
    return request<NotificationsResponse>(`/driver/notifications${query}`, { method: 'GET' });
  },

  markAsRead: async (id: string) => {
    return request<any>(`/driver/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async () => {
    return request<any>('/driver/notifications/read-all', { method: 'PUT' });
  },

  deleteNotification: async (id: string) => {
    return request<any>(`/driver/notifications/${id}`, { method: 'DELETE' });
  },

  clearAll: async () => {
    return request<any>('/driver/notifications', { method: 'DELETE' });
  },
};
