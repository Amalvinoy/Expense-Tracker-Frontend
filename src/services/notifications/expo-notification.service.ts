import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  INotificationService,
  INotificationBackendAdapter,
  NotificationPayload,
  BudgetWarningParams,
  MonthlySummaryParams,
  DailyReminderParams,
} from './notification.types';
import { notificationStorage } from '@/services/storage/repositories/notification.storage';
import { notificationDedupService } from './notification-dedup.service';

const DAILY_REMINDER_ID = 'daily_expense_reminder_scheduled';

export class ExpoNotificationService implements INotificationService {
  private isInitialized = false;
  private backendAdapter: INotificationBackendAdapter | null = null;

  public setBackendAdapter(adapter: INotificationBackendAdapter | null): void {
    this.backendAdapter = adapter;
    if (adapter) {
      console.log(`[NotificationService] Connected backend adapter: ${adapter.name}`);
    }
  }

  public getBackendAdapter(): INotificationBackendAdapter | null {
    return this.backendAdapter;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure default foreground presentation options
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Setup Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminders', {
          name: 'Daily Expense Reminders',
          description: 'Reminders to log daily expenses in the evening',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });

        await Notifications.setNotificationChannelAsync('budget-warnings', {
          name: 'Budget Warnings',
          description: 'Alerts when expenses cross your defined budget threshold',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#DC2626',
        });

        await Notifications.setNotificationChannelAsync('monthly-reports', {
          name: 'Monthly Spending Reports',
          description: 'Summaries of total spending at the start or close of month',
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: '#059669',
        });
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('[NotificationService] Initialization warning:', err);
      this.isInitialized = true; // Still mark initialized to avoid infinite retries
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const perm = await window.Notification.requestPermission();
          return perm === 'granted';
        }
        return true;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (err) {
      console.warn('[NotificationService] Permission request failed:', err);
      return false;
    }
  }

  public async hasPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          return window.Notification.permission === 'granted';
        }
        return true;
      }

      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  public async scheduleDailyReminder(params: DailyReminderParams): Promise<string | null> {
    await this.init();

    try {
      // Cancel previous scheduled daily reminder to avoid duplicates
      await this.cancelDailyReminder();

      const hasPerm = await this.requestPermissions();
      if (!hasPerm) {
        console.log('[NotificationService] Skipping daily reminder schedule: permission not granted');
        return null;
      }

      const hour = Math.max(0, Math.min(23, params.hour));
      const minute = Math.max(0, Math.min(59, params.minute));

      const title = 'Daily Expense Reminder 📝';
      const body =
        params.customMessage ||
        "Don't forget to track today's expenses to keep your budget on target!";

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: DAILY_REMINDER_ID,
        content: {
          title,
          body,
          data: {
            type: 'daily_reminder',
            scheduledHour: hour,
            scheduledMinute: minute,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'daily-reminders',
        },
      });

      console.log(`[NotificationService] Scheduled daily reminder at ${hour}:${minute.toString().padStart(2, '0')} (ID: ${notificationId})`);
      return notificationId;
    } catch (err) {
      console.warn('[NotificationService] Failed to schedule daily reminder:', err);
      return null;
    }
  }

  public async cancelDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    } catch {
      // Ignore if not found
    }
  }

  public async sendBudgetWarning(params: BudgetWarningParams): Promise<string | null> {
    await this.init();

    const targetKey = params.categoryId || 'monthly_total';
    const currentMonth = new Date().toISOString().substring(0, 7);
    const thresholdLevel = params.percent >= 100 ? 100 : 80;

    // Deduplication check: do not send unnecessary repeated notifications
    const canSend = await notificationDedupService.canSendBudgetWarning(
      targetKey,
      currentMonth,
      thresholdLevel
    );

    if (!canSend) {
      console.log(`[NotificationService] Budget warning suppressed by deduplication: ${targetKey} at ${thresholdLevel}%`);
      return null;
    }

    const symbol = params.currencySymbol || '₹';
    const isExceeded = params.percent >= 100;
    const categoryLabel = params.categoryName || 'Monthly Total';

    const title = isExceeded
      ? `Budget Exceeded: ${categoryLabel} 🚨`
      : `Budget Warning: ${categoryLabel} ⚠️`;

    const body = isExceeded
      ? `You have spent ${symbol}${params.spent.toLocaleString()} which exceeds your budget of ${symbol}${params.budget.toLocaleString()} (${Math.round(params.percent)}%).`
      : `You have spent ${symbol}${params.spent.toLocaleString()}, which is ${Math.round(params.percent)}% of your ${symbol}${params.budget.toLocaleString()} budget.`;

    const notificationId = await this.presentLocalNotification({
      type: 'budget_warning',
      title,
      body,
      priority: isExceeded ? 'urgent' : 'high',
      channelId: 'budget-warnings',
      data: {
        categoryId: params.categoryId,
        categoryName: params.categoryName,
        spent: params.spent,
        budget: params.budget,
        percent: params.percent,
        thresholdLevel,
        monthKey: currentMonth,
      },
    });

    if (notificationId) {
      await notificationDedupService.recordBudgetWarningSent(
        targetKey,
        currentMonth,
        thresholdLevel
      );
    }

    return notificationId;
  }

  public async sendMonthlySummary(params: MonthlySummaryParams): Promise<string | null> {
    await this.init();

    const canSend = await notificationDedupService.canSendMonthlySummary(params.monthKey);
    if (!canSend) {
      console.log(`[NotificationService] Monthly summary suppressed: already sent for ${params.monthKey}`);
      return null;
    }

    const symbol = params.currencySymbol || '₹';
    const title = `Monthly Spending Digest 📊`;
    let body = `In ${params.monthName}, your total spending was ${symbol}${params.totalSpent.toLocaleString()}.`;

    if (params.topCategory && params.topCategoryAmount) {
      body += ` Top spending was on ${params.topCategory} (${symbol}${params.topCategoryAmount.toLocaleString()}).`;
    }

    const notificationId = await this.presentLocalNotification({
      type: 'monthly_summary',
      title,
      body,
      priority: 'normal',
      channelId: 'monthly-reports',
      data: {
        monthKey: params.monthKey,
        totalSpent: params.totalSpent,
        totalBudget: params.totalBudget,
        topCategory: params.topCategory,
      },
    });

    if (notificationId) {
      await notificationDedupService.recordMonthlySummarySent(params.monthKey);
    }

    return notificationId;
  }

  public async presentLocalNotification(
    payload: Omit<NotificationPayload, 'id' | 'timestamp' | 'isRead'> & { id?: string }
  ): Promise<string | null> {
    await this.init();

    const id = payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const storedNotification: NotificationPayload = {
      id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      timestamp: nowIso,
      isRead: false,
      priority: payload.priority || 'normal',
      channelId: payload.channelId,
    };

    // 1. Store in local repository for in-app notification center history
    const existing = await notificationStorage.getNotifications();
    await notificationStorage.saveNotifications([storedNotification, ...existing]);

    // 2. Trigger native OS presentation if permissions are active
    try {
      const hasPerm = await this.hasPermissions();
      if (hasPerm) {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(payload.title, {
              body: payload.body,
              icon: '/favicon.png',
            });
          }
        } else {
          await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
              title: payload.title,
              body: payload.body,
              data: payload.data,
            },
            trigger: null, // immediate delivery
          });
        }
      }
    } catch (err) {
      console.warn('[NotificationService] Local presentation error:', err);
    }

    return id;
  }

  public async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignore
    }
  }

  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('[NotificationService] Cancel all notifications failed:', err);
    }
  }

  public async getPushToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return null;

      // In Expo SDK 53+, remote push notifications on Android require an Expo development build
      const isExpoGo =
        Constants.appOwnership === 'expo' ||
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
      if (Platform.OS === 'android' && isExpoGo) {
        console.log(
          '[NotificationService] Remote push tokens on Android require an Expo development build; skipping in Expo Go.'
        );
        return null;
      }

      const hasPerm = await this.requestPermissions();
      if (!hasPerm) return null;

      const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
      const token = tokenData?.data || null;

      if (token && this.backendAdapter) {
        await this.backendAdapter.registerPushToken(token);
      }

      return token;
    } catch (err) {
      console.warn('[NotificationService] Could not obtain push token:', err);
      return null;
    }
  }
}

export const notificationService = new ExpoNotificationService();
