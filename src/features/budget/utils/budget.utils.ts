import {
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { Expense } from '@/features/expenses/types/expense.types';
import {
  BudgetWarningTier,
  BudgetProgressInfo,
} from '../types/budget.types';
import { BUDGET_TIER_CONFIGS } from '../constants/budget.constants';

/**
 * Determines the warning tier based on percentage used
 * - below 50%: safe (On Track)
 * - 50–80%: moderate
 * - 80–100%: caution
 * - over budget: exceeded
 */
export const getWarningTier = (percentage: number): BudgetWarningTier => {
  if (percentage < 50) {
    return 'safe';
  }
  if (percentage <= 80) {
    return 'moderate';
  }
  if (percentage <= 100) {
    return 'caution';
  }
  return 'exceeded';
};

/**
 * Calculates complete budget progress metrics, remaining balances, and warning status
 */
export const calculateBudgetProgress = (
  budgetAmount: number,
  spentAmount: number
): BudgetProgressInfo => {
  const remaining = budgetAmount - spentAmount;
  const percentage =
    budgetAmount > 0
      ? (spentAmount / budgetAmount) * 100
      : spentAmount > 0
      ? 100
      : 0;

  // Round percentage to two decimal places (e.g. 64.25%)
  const roundedPercentage = Math.round(percentage * 100) / 100;
  const tier = getWarningTier(roundedPercentage);
  const tierLabel = BUDGET_TIER_CONFIGS[tier].label;

  return {
    budgetAmount,
    spentAmount,
    remainingAmount: remaining,
    percentageUsed: roundedPercentage,
    tier,
    tierLabel,
    isOverBudget: remaining < 0,
  };
};

/**
 * Calculates total spending for a specific category within a target month
 */
export const calculateCategorySpendingForMonth = (
  expenses: Expense[],
  categoryId?: string,
  categoryName?: string,
  targetMonth: Date = new Date()
): number => {
  const start = startOfMonth(targetMonth);
  const end = endOfMonth(targetMonth);

  return expenses.reduce((sum, exp) => {
    try {
      const expDate = parseISO(exp.date);
      if (!isValid(expDate) || !isWithinInterval(expDate, { start, end })) {
        return sum;
      }

      const matchesId = categoryId && exp.categoryId === categoryId;
      const matchesName =
        categoryName &&
        exp.categoryName.toLowerCase() === categoryName.toLowerCase();

      if (matchesId || matchesName) {
        return sum + exp.amount;
      }
      return sum;
    } catch {
      return sum;
    }
  }, 0);
};

/**
 * Calculates total overall spending for a target month
 */
export const calculateTotalSpendingForMonth = (
  expenses: Expense[],
  targetMonth: Date = new Date()
): number => {
  const start = startOfMonth(targetMonth);
  const end = endOfMonth(targetMonth);

  return expenses.reduce((sum, exp) => {
    try {
      const expDate = parseISO(exp.date);
      if (isValid(expDate) && isWithinInterval(expDate, { start, end })) {
        return sum + exp.amount;
      }
      return sum;
    } catch {
      return sum;
    }
  }, 0);
};
