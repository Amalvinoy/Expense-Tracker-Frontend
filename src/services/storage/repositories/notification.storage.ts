import { storageService } from '../storage.service';
import { STORAGE_KEYS } from '../storage.keys';
import { NotificationPayload } from '@/services/notifications/notification.types';

export interface NotificationDispatchLog {
  lastDailyReminderDate?: string; // YYYY-MM-DD
  budgetWarningsSent: Record<string, string>; // key: `${targetKey}_${monthKey}_${threshold}` -> ISO date
  monthlySummariesSent: Record<string, string>; // key: `${monthKey}` -> ISO date
  lastDispatchTimestamp?: number;
}

const DEFAULT_DISPATCH_LOG: NotificationDispatchLog = {
  budgetWarningsSent: {},
  monthlySummariesSent: {},
};

export const notificationStorage = {
  /**
   * Get all stored notifications
   */
  async getNotifications(): Promise<NotificationPayload[]> {
    try {
      const list = await storageService.getItem<NotificationPayload[]>(
        STORAGE_KEYS.NOTIFICATIONS
      );
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.warn('[NotificationStorage] Failed to load notifications:', error);
      return [];
    }
  },

  /**
   * Save notifications list
   */
  async saveNotifications(notifications: NotificationPayload[]): Promise<boolean> {
    try {
      // Keep at most recent 100 notifications locally to avoid bloating storage
      const trimmed = notifications.slice(0, 100);
      return await storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, trimmed);
    } catch (error) {
      console.error('[NotificationStorage] Failed to save notifications:', error);
      return false;
    }
  },

  /**
   * Get notification deduplication/dispatch log
   */
  async getDispatchLog(): Promise<NotificationDispatchLog> {
    try {
      const log = await storageService.getItem<NotificationDispatchLog>(
        STORAGE_KEYS.NOTIFICATION_DISPATCH_LOG
      );
      if (log && typeof log === 'object') {
        return {
          budgetWarningsSent: log.budgetWarningsSent || {},
          monthlySummariesSent: log.monthlySummariesSent || {},
          lastDailyReminderDate: log.lastDailyReminderDate,
          lastDispatchTimestamp: log.lastDispatchTimestamp,
        };
      }
      return DEFAULT_DISPATCH_LOG;
    } catch (error) {
      console.warn('[NotificationStorage] Failed to load dispatch log:', error);
      return DEFAULT_DISPATCH_LOG;
    }
  },

  /**
   * Save notification deduplication/dispatch log
   */
  async saveDispatchLog(log: NotificationDispatchLog): Promise<boolean> {
    try {
      return await storageService.setItem(
        STORAGE_KEYS.NOTIFICATION_DISPATCH_LOG,
        log
      );
    } catch (error) {
      console.error('[NotificationStorage] Failed to save dispatch log:', error);
      return false;
    }
  },

  /**
   * Clear all notification data
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      storageService.removeItem(STORAGE_KEYS.NOTIFICATIONS),
      storageService.removeItem(STORAGE_KEYS.NOTIFICATION_DISPATCH_LOG),
    ]);
  },
};
