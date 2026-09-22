import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New Assignment',
    body: 'You have been assigned order #KC10248.',
    timestamp: '10 mins ago',
    read: false,
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearAll: () => set({ notifications: [] }),
}));
