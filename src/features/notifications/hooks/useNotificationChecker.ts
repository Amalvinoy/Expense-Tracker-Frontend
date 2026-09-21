import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useExpenseStore } from '@/store/expense.store';
import { useBudgetStore } from '@/features/budget/store/budget.store';
import { notificationService } from '@/services/notifications';
import { useNotificationStore } from '../store/notification.store';

export function useNotificationChecker() {
  const { settings } = useSettingsStore();
  const { expenses } = useExpenseStore();
  const { monthlyTotalBudget, categoryBudgets } = useBudgetStore();
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);

  const isEvaluatingRef = useRef(false);

  useEffect(() => {
    // Initial load of notifications
    loadNotifications();
    notificationService.init();
  }, [loadNotifications]);

  // Synchronize scheduled daily reminder when settings change
  useEffect(() => {
    if (settings.notifications.dailyReminder) {
      const timeStr = settings.notifications.dailyReminderTime || '20:00';
      const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
      notificationService.scheduleDailyReminder({ hour: h, minute: m });
    } else {
      notificationService.cancelDailyReminder();
    }
  }, [settings.notifications.dailyReminder, settings.notifications.dailyReminderTime]);

  // Evaluate budget thresholds and monthly summaries when financial data changes
  useEffect(() => {
    if (isEvaluatingRef.current) return;

    const evaluateAlerts = async () => {
      isEvaluatingRef.current = true;
      try {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const threshold = settings.notifications.budgetWarningThreshold || 80;

        // 1. Budget Warning Evaluation
        if (settings.notifications.budgetAlerts) {
          // Current month expenses
          const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));
          const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

          // Check monthly total budget
          if (monthlyTotalBudget > 0) {
            const totalPercent = (totalSpent / monthlyTotalBudget) * 100;
            if (totalPercent >= threshold) {
              const notifId = await notificationService.sendBudgetWarning({
                spent: totalSpent,
                budget: monthlyTotalBudget,
                percent: totalPercent,
                currencySymbol: settings.currency.symbol,
              });
              if (notifId) {
                await loadNotifications();
              }
            }
          }

          // Check each category budget
          for (const budget of categoryBudgets) {
            if (!budget.categoryId || budget.amount <= 0) continue;

            const categorySpent = monthExpenses
              .filter((e) => e.categoryId === budget.categoryId)
              .reduce((acc, curr) => acc + curr.amount, 0);

            const catPercent = (categorySpent / budget.amount) * 100;
            if (catPercent >= threshold) {
              const notifId = await notificationService.sendBudgetWarning({
                categoryId: budget.categoryId,
                categoryName: budget.categoryName,
                spent: categorySpent,
                budget: budget.amount,
                percent: catPercent,
                currencySymbol: settings.currency.symbol,
              });
              if (notifId) {
                await loadNotifications();
              }
            }
          }
        }

        // 2. Monthly Spending Summary Evaluation
        if (settings.notifications.monthlySummary) {
          // Evaluate previous month summary if on the 1st week of the month
          const isStartOfMonth = now.getDate() <= 7;
          let targetMonthKey = currentMonthKey;
          let targetMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

          if (isStartOfMonth) {
            // Previous month
            const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            targetMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
            targetMonthName = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          }

          const targetExpenses = expenses.filter((e) => e.date.startsWith(targetMonthKey));
          if (targetExpenses.length > 0) {
            const totalSpent = targetExpenses.reduce((acc, curr) => acc + curr.amount, 0);

            // Find top category
            const categorySums: Record<string, { name: string; amount: number }> = {};
            targetExpenses.forEach((e) => {
              const catName = e.categoryName || 'Other';
              if (!categorySums[catName]) {
                categorySums[catName] = { name: catName, amount: 0 };
              }
              categorySums[catName].amount += e.amount;
            });

            const sortedCategories = Object.values(categorySums).sort(
              (a, b) => b.amount - a.amount
            );
            const topCategory = sortedCategories[0];

            const notifId = await notificationService.sendMonthlySummary({
              monthKey: targetMonthKey,
              monthName: targetMonthName,
              totalSpent,
              totalBudget: monthlyTotalBudget,
              topCategory: topCategory?.name,
              topCategoryAmount: topCategory?.amount,
              currencySymbol: settings.currency.symbol,
            });

            if (notifId) {
              await loadNotifications();
            }
          }
        }
      } catch (err) {
        console.warn('[NotificationChecker] Evaluation error:', err);
      } finally {
        isEvaluatingRef.current = false;
      }
    };

    evaluateAlerts();
  }, [
    expenses,
    monthlyTotalBudget,
    categoryBudgets,
    settings.notifications.budgetAlerts,
    settings.notifications.monthlySummary,
    settings.notifications.budgetWarningThreshold,
    settings.currency.symbol,
    loadNotifications,
  ]);
}
