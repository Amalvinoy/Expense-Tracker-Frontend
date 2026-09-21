import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { DashboardData } from '../types/dashboard.types';
import { useExpenseStore } from '@/store/expense.store';
import { useBudgetStore } from '@/features/budget/store/budget.store';
import { useAuthStore } from '@/store/auth.store';
import {
  calculateDailyTotal,
  calculateMonthlyTotal,
  groupExpensesByCategory,
} from '@/features/expenses/utils/expense.utils';

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  greeting: string;
  currentDateFormatted: string;
  budgetHealth: 'safe' | 'warning' | 'danger';
  isEmpty: boolean;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { expenses, error: expenseError } = useExpenseStore();
  const { monthlyTotalBudget } = useBudgetStore();
  const [isLoading, setIsLoading] = useState<boolean>(() => useAuthStore.getState().isAuthenticated);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Business logic: compute time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  }, []);

  // Business logic: format current date (e.g. "September 19")
  const currentDateFormatted = useMemo(() => {
    return format(new Date(), 'MMMM d');
  }, []);

  // Calculate live data from store expenses and dynamic user budget
  const liveDashboardData = useMemo<DashboardData>(() => {
    const monthlyBudget = monthlyTotalBudget || 0;
    const todaySpending = calculateDailyTotal(expenses);
    const monthlySpending = calculateMonthlyTotal(expenses);
    const remainingBudget = monthlyBudget > 0 ? monthlyBudget - monthlySpending : 0;
    const budgetProgressPercentage =
      monthlyBudget > 0 ? Number(((monthlySpending / monthlyBudget) * 100).toFixed(1)) : 0;

    const categoryGroups = groupExpensesByCategory(expenses);
    const categorySpending = categoryGroups.map((g) => ({
      category: g.categoryName as any,
      amount: g.totalAmount,
      percentage: g.percentage,
      transactionCount: g.transactionCount,
    }));

    return {
      summary: {
        todaySpending,
        monthlySpending,
        monthlyBudget,
        remainingBudget,
        budgetProgressPercentage,
        currency: 'INR',
      },
      recentExpenses: expenses.slice(0, 5).map((e) => ({
        id: e.id,
        title: e.note || e.categoryName,
        amount: e.amount,
        currency: 'INR',
        category: e.categoryName as any,
        paymentMethod: e.paymentMethod,
        date: e.date,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      categorySpending,
    };
  }, [expenses, monthlyTotalBudget]);

  const data = liveDashboardData;

  // Refresh handler
  const refresh = useCallback(async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    setIsRefreshing(true);
    setError(null);
    try {
      await Promise.all([
        useExpenseStore.getState().loadExpenses(),
        useBudgetStore.getState().loadBudgets(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve dashboard information.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const retry = useCallback(async () => {
    setError(null);
    await refresh();
  }, [refresh]);

  // Initial load
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }
    let isMounted = true;
    Promise.all([
      useExpenseStore.getState().loadExpenses(),
      useBudgetStore.getState().loadBudgets(),
    ])
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve dashboard information.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading]);

  // Derive error from local state or expense store
  const activeError = error || expenseError || null;

  // Business logic: budget health indicator
  const budgetHealth = useMemo<'safe' | 'warning' | 'danger'>(() => {
    if (!data || data.summary.monthlyBudget === 0) return 'safe';
    const progress = data.summary.budgetProgressPercentage;
    if (progress > 100) return 'danger';
    if (progress >= 80) return 'warning';
    return 'safe';
  }, [data]);

  const isEmpty = useMemo(() => {
    return !!data && data.recentExpenses.length === 0 && data.summary.monthlySpending === 0;
  }, [data]);

  return {
    data,
    isLoading,
    isRefreshing,
    error: activeError,
    greeting,
    currentDateFormatted,
    budgetHealth,
    isEmpty,
    refresh,
    retry,
  };
};
