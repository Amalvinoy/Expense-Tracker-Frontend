import { create } from 'zustand';
import {
  NotificationPayload,
  notificationService,
} from '@/services/notifications';
import { notificationStorage } from '@/services/storage/repositories/notification.storage';

interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Test triggers for manual preview and verification
  sendTestDailyReminder: () => Promise<void>;
  sendTestBudgetWarning: () => Promise<void>;
  sendTestMonthlySummary: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async () => {
    set({ isLoading: true });
    try {
      const list = await notificationStorage.getNotifications();
      const unread = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch {
      set({ notifications: [], unreadCount: 0, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });
    await notificationStorage.saveNotifications(updated);
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
    await notificationStorage.saveNotifications(updated);
  },

  deleteNotification: async (id: string) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });
    await notificationStorage.saveNotifications(updated);
  },

  clearAll: async () => {
    set({ notifications: [], unreadCount: 0 });
    await notificationStorage.clearAll();
  },

  sendTestDailyReminder: async () => {
    await notificationService.presentLocalNotification({
      type: 'daily_reminder',
      title: 'Daily Expense Reminder 📝',
      body: "Take a moment to record today's coffee, groceries, and travel expenses.",
      priority: 'high',
      channelId: 'daily-reminders',
      data: { isTest: true },
    });
    await get().loadNotifications();
  },

  sendTestBudgetWarning: async () => {
    await notificationService.presentLocalNotification({
      type: 'budget_warning',
      title: 'Budget Limit Warning: Dining Out ⚠️',
      body: 'You have spent ₹4,250 of your ₹5,000 Dining Out budget (85%).',
      priority: 'high',
      channelId: 'budget-warnings',
      data: { isTest: true, percent: 85, category: 'Dining Out' },
    });
    await get().loadNotifications();
  },

  sendTestMonthlySummary: async () => {
    const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await notificationService.presentLocalNotification({
      type: 'monthly_summary',
      title: 'Monthly Spending Summary 📊',
      body: `In ${monthName}, your total expenditure was ₹28,450 across 42 transactions. Top category: Groceries (₹9,800).`,
      priority: 'normal',
      channelId: 'monthly-reports',
      data: { isTest: true, monthName },
    });
    await get().loadNotifications();
  },
}));
