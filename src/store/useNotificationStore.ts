import { create } from 'zustand';

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
}

interface NotificationState {
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'SURGE',
    title: 'Surge Active: +₹25 per order',
    body: 'High demand in HSR Sector 2 hub. Extra ₹25 incentive automatically credited on all orders completed before 2:30 PM.',
    timestamp: '12 mins ago',
    read: false,
    amount: '+₹25/order',
    actionRoute: 'Home',
    actionLabel: 'View Surge',
  },
  {
    id: 'notif-2',
    category: 'ORDER',
    title: 'New Order Assignment: #KC-ORD-8492',
    body: 'Pickup at KudiCart Darkstore, HSR Sector 2. Delivery to 12th Main Road, Sector 2. Please proceed to the store.',
    timestamp: '28 mins ago',
    read: false,
    actionRoute: 'OrderDetails',
    actionLabel: 'View Order',
  },
  {
    id: 'notif-3',
    category: 'SURGE',
    title: 'Rain Surge Active: +₹35 per order',
    body: 'Bad weather incentive active across Southeast Bengaluru delivery zones. Drive safely and earn +₹35 per delivery.',
    timestamp: '1 hour ago',
    read: true,
    amount: '+₹35/order',
  },
  {
    id: 'notif-4',
    category: 'SHIFT',
    title: 'Slot Booking Reminder',
    body: 'Weekly delivery slots for next week open on Friday at 6:00 PM. Reserve early to lock your preferred delivery hours.',
    timestamp: '3 hours ago',
    read: true,
    actionRoute: 'Slots',
    actionLabel: 'View Slots',
  },
  {
    id: 'notif-5',
    category: 'PAYOUT',
    title: 'Weekly Payout Deposited',
    body: '₹4,820.00 for the period 05 Oct – 11 Oct has been successfully transferred to your linked HDFC Bank account.',
    timestamp: 'Yesterday',
    read: true,
    amount: '₹4,820.00',
    actionRoute: 'Earnings',
    actionLabel: 'View Ledger',
  },
  {
    id: 'notif-6',
    category: 'SYSTEM',
    title: 'PAN Card Verified',
    body: 'Your Permanent Account Number has been successfully verified with tax compliance databases. Payouts are active.',
    timestamp: '2 days ago',
    read: true,
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

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
