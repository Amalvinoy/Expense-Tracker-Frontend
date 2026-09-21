import { ExpenseCategory, ExpenseItem } from '@/types/expense.types';

export type { ExpenseItem };
export type BudgetHealthStatus = 'safe' | 'good' | 'warning' | 'danger';

export interface DashboardSummary {
  todaySpending: number;
  monthlySpending: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetProgressPercentage: number;
  currency: string;
}

export interface CategorySpending {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export type CategorySpendingItem = CategorySpending;

export interface DashboardData {
  summary: DashboardSummary;
  recentExpenses: ExpenseItem[];
  categorySpending: CategorySpending[];
}
