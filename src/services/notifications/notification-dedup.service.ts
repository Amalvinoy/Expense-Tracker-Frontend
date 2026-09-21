import { notificationStorage } from '@/services/storage/repositories/notification.storage';

/**
 * Notification Deduplication & Anti-Spam Guard Service
 * Enforces business rules to prevent unnecessary, repeated, or spammy notifications.
 */
class NotificationDedupService {
  private memoryLastDispatchTimestamp: number = 0;
  private readonly MIN_INTERVAL_MS = 3000; // Minimum 3 seconds between notifications

  /**
   * Helper to format today's date key as YYYY-MM-DD
   */
  private getTodayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Check rate-limiting throttle to avoid rapid-fire bursts
   */
  public isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.memoryLastDispatchTimestamp < this.MIN_INTERVAL_MS) {
      return true;
    }
    return false;
  }

  public recordDispatch(): void {
    this.memoryLastDispatchTimestamp = Date.now();
  }

  /**
   * Evaluate if a daily expense reminder should be sent.
   * Rules:
   * 1. If the user has already recorded at least 1 expense today -> DO NOT SEND.
   * 2. If a reminder was already sent today -> DO NOT SEND.
   */
  public async canSendDailyReminder(todayExpenseCount: number): Promise<boolean> {
    if (todayExpenseCount > 0) {
      // User has already tracked today's spending!
      return false;
    }

    const log = await notificationStorage.getDispatchLog();
    const today = this.getTodayKey();

    if (log.lastDailyReminderDate === today) {
      // Already sent today
      return false;
    }

    return true;
  }

  /**
   * Mark today's daily reminder as sent.
   */
  public async recordDailyReminderSent(): Promise<void> {
    const log = await notificationStorage.getDispatchLog();
    log.lastDailyReminderDate = this.getTodayKey();
    log.lastDispatchTimestamp = Date.now();
    this.recordDispatch();
    await notificationStorage.saveDispatchLog(log);
  }

  /**
   * Evaluate if a budget warning can be sent.
   * Rules:
   * 1. Check if an alert for this specific target (category or total) and threshold (e.g., 80 or 100)
   *    has already been sent this month.
   * 2. If already sent for this threshold level in this month -> DO NOT SEND.
   */
  public async canSendBudgetWarning(
    targetKey: string, // categoryId or 'monthly_total'
    monthKey: string,  // e.g. '2026-09'
    thresholdLevel: number // 80 or 100
  ): Promise<boolean> {
    if (this.isRateLimited()) {
      return false;
    }

    const log = await notificationStorage.getDispatchLog();
    const alertKey = `${targetKey}_${monthKey}_${thresholdLevel}`;

    if (log.budgetWarningsSent[alertKey]) {
      // Already triggered for this threshold and month
      return false;
    }

    return true;
  }

  /**
   * Record that a budget warning alert was sent for this category/month/threshold.
   */
  public async recordBudgetWarningSent(
    targetKey: string,
    monthKey: string,
    thresholdLevel: number
  ): Promise<void> {
    const log = await notificationStorage.getDispatchLog();
    const alertKey = `${targetKey}_${monthKey}_${thresholdLevel}`;
    log.budgetWarningsSent[alertKey] = new Date().toISOString();
    log.lastDispatchTimestamp = Date.now();
    this.recordDispatch();
    await notificationStorage.saveDispatchLog(log);
  }

  /**
   * Evaluate if a monthly spending summary can be sent.
   * Rules:
   * 1. A summary for a specific calendar month (YYYY-MM) is sent AT MOST ONCE.
   */
  public async canSendMonthlySummary(monthKey: string): Promise<boolean> {
    if (this.isRateLimited()) {
      return false;
    }

    const log = await notificationStorage.getDispatchLog();
    if (log.monthlySummariesSent[monthKey]) {
      // Summary for this month has already been delivered
      return false;
    }

    return true;
  }

  /**
   * Record that monthly summary was sent for the specified month.
   */
  public async recordMonthlySummarySent(monthKey: string): Promise<void> {
    const log = await notificationStorage.getDispatchLog();
    log.monthlySummariesSent[monthKey] = new Date().toISOString();
    log.lastDispatchTimestamp = Date.now();
    this.recordDispatch();
    await notificationStorage.saveDispatchLog(log);
  }

  /**
   * Reset deduplication log (for testing or user data wipe)
   */
  public async resetLog(): Promise<void> {
    await notificationStorage.clearAll();
  }
}

export const notificationDedupService = new NotificationDedupService();
