/**
 * Notification Types and Abstraction Interfaces
 * Designed to support local Expo notifications now and backend-driven notifications later.
 */

export type NotificationType =
  | 'daily_reminder'
  | 'budget_warning'
  | 'monthly_summary'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string; // ISO 8601
  isRead: boolean;
  priority?: NotificationPriority;
  channelId?: string;
}

export interface BudgetWarningParams {
  categoryId?: string;
  categoryName?: string;
  spent: number;
  budget: number;
  percent: number;
  currencySymbol?: string;
}

export interface MonthlySummaryParams {
  monthKey: string; // e.g., '2026-09'
  monthName: string; // e.g., 'September 2026'
  totalSpent: number;
  totalBudget?: number;
  topCategory?: string;
  topCategoryAmount?: number;
  currencySymbol?: string;
}

export interface DailyReminderParams {
  hour: number;
  minute: number;
  customMessage?: string;
}

/**
 * Backend Adapter interface to allow future integration with
 * backend push services (FCM / APNs / WebPush / Custom WebSocket)
 * without rewriting the notification infrastructure.
 */
export interface INotificationBackendAdapter {
  name: string;
  registerPushToken(token: string, userId?: string): Promise<boolean>;
  syncPreferences(preferences: Record<string, any>): Promise<boolean>;
  fetchRemoteNotifications?(limit?: number): Promise<NotificationPayload[]>;
  markRemoteNotificationRead?(notificationId: string): Promise<void>;
}

/**
 * Core Notification Service Abstraction
 */
export interface INotificationService {
  /**
   * Initialize notification handlers, channels, and platform listeners.
   */
  init(): Promise<void>;

  /**
   * Request push/local notification permissions from the OS.
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Check if the app currently has permission to deliver notifications.
   */
  hasPermissions(): Promise<boolean>;

  /**
   * Schedule or update a recurring daily reminder.
   */
  scheduleDailyReminder(params: DailyReminderParams): Promise<string | null>;

  /**
   * Cancel currently scheduled daily reminders.
   */
  cancelDailyReminder(): Promise<void>;

  /**
   * Dispatch a budget warning alert.
   */
  sendBudgetWarning(params: BudgetWarningParams): Promise<string | null>;

  /**
   * Dispatch a monthly financial summary notification.
   */
  sendMonthlySummary(params: MonthlySummaryParams): Promise<string | null>;

  /**
   * Present an immediate local notification banner/dialog.
   */
  presentLocalNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp' | 'isRead'> & { id?: string }): Promise<string | null>;

  /**
   * Cancel a specific pending/scheduled notification by ID.
   */
  cancelNotification(id: string): Promise<void>;

  /**
   * Cancel all pending scheduled notifications.
   */
  cancelAllNotifications(): Promise<void>;

  /**
   * Obtain device push token (for future backend push messaging).
   */
  getPushToken(): Promise<string | null>;

  /**
   * Connect a backend notification adapter (e.g. Firebase, REST API).
   */
  setBackendAdapter(adapter: INotificationBackendAdapter | null): void;

  /**
   * Get currently active backend adapter (if any).
   */
  getBackendAdapter(): INotificationBackendAdapter | null;
}
