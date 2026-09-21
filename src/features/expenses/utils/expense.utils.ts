import {
  parseISO,
  isValid,
  isToday,
  isYesterday,
  isSameDay,
  isSameMonth,
  isSameYear,
  format,
} from 'date-fns';
import {
  Expense,
  ExpensesByCategoryGroup,
  ExpensesByDateGroup,
} from '../types/expense.types';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE, CURRENCY_SYMBOL } from '../constants/expense.constants';

export interface FormatExpenseAmountOptions {
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
  showSign?: boolean;
  isIncome?: boolean;
}

/**
 * 1. formatExpenseAmount
 * Formats a numeric amount with the Indian Rupee (INR / ₹) symbol and en-IN thousand separators.
 * e.g., 450 -> "₹450", 12850 -> "₹12,850", 1450.75 -> "₹1,450.75"
 */
export const formatExpenseAmount = (
  amount: number,
  options?: FormatExpenseAmountOptions
): string => {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    showDecimals = amount % 1 !== 0,
    showSign = false,
    isIncome = false,
  } = options || {};

  try {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(absAmount);

    let prefix = '';
    if (showSign) {
      prefix = isIncome ? '+' : '-';
    }

    return `${prefix}${formatted}`;
  } catch {
    const symbol = currency === 'INR' ? CURRENCY_SYMBOL : `${currency} `;
    return `${symbol}${amount.toLocaleString(locale)}`;
  }
};

/**
 * 2. formatExpenseDate
 * Formats an ISO date string or Date object into human-friendly representation.
 * Supports relative "Today", "Yesterday", or formatted dates like "Sep 19, 2026".
 */
export const formatExpenseDate = (
  dateInput: string | Date,
  pattern: string = 'MMM dd, yyyy'
): string => {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(date)) return 'Invalid Date';

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';

    return format(date, pattern);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * 3. calculateDailyTotal
 * Calculates total spending for a specific day (defaults to today).
 */
export const calculateDailyTotal = (
  expenses: Expense[],
  targetDateInput: string | Date = new Date()
): number => {
  try {
    const targetDate =
      typeof targetDateInput === 'string' ? parseISO(targetDateInput) : targetDateInput;
    if (!isValid(targetDate)) return 0;

    return expenses.reduce((total, expense) => {
      const expDate = parseISO(expense.date);
      if (isValid(expDate) && isSameDay(expDate, targetDate)) {
        return total + expense.amount;
      }
      return total;
    }, 0);
  } catch {
    return 0;
  }
};

/**
 * 4. calculateMonthlyTotal
 * Calculates total spending for a specific month and year (defaults to current month).
 */
export const calculateMonthlyTotal = (
  expenses: Expense[],
  targetDateInput: string | Date = new Date()
): number => {
  try {
    const targetDate =
      typeof targetDateInput === 'string' ? parseISO(targetDateInput) : targetDateInput;
    if (!isValid(targetDate)) return 0;

    return expenses.reduce((total, expense) => {
      const expDate = parseISO(expense.date);
      if (
        isValid(expDate) &&
        isSameMonth(expDate, targetDate) &&
        isSameYear(expDate, targetDate)
      ) {
        return total + expense.amount;
      }
      return total;
    }, 0);
  } catch {
    return 0;
  }
};

/**
 * 5. groupExpensesByCategory
 * Groups a collection of expenses by category, calculates the subtotal, transaction count,
 * percentage of total spending, and returns them sorted descending by amount.
 */
export const groupExpensesByCategory = (
  expenses: Expense[]
): ExpensesByCategoryGroup[] => {
  if (!expenses || expenses.length === 0) return [];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const map = new Map<string, ExpensesByCategoryGroup>();

  expenses.forEach((expense) => {
    const existing = map.get(expense.categoryId);
    if (existing) {
      existing.totalAmount += expense.amount;
      existing.transactionCount += 1;
      existing.expenses.push(expense);
    } else {
      map.set(expense.categoryId, {
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        categoryIcon: expense.categoryIcon,
        totalAmount: expense.amount,
        transactionCount: 1,
        percentage: 0,
        expenses: [expense],
      });
    }
  });

  const groups = Array.from(map.values());

  // Calculate percentage and sort descending by totalAmount
  return groups
    .map((group) => ({
      ...group,
      percentage:
        totalSpent > 0
          ? Number(((group.totalAmount / totalSpent) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
};

/**
 * 6. groupExpensesByDate
 * Groups expenses by calendar date (YYYY-MM-DD), sorts the groups descending (newest first),
 * and computes daily subtotals.
 */
export const groupExpensesByDate = (
  expenses: Expense[]
): ExpensesByDateGroup[] => {
  if (!expenses || expenses.length === 0) return [];

  const map = new Map<string, { date: Date; expenses: Expense[] }>();

  expenses.forEach((expense) => {
    const date = parseISO(expense.date);
    const dateKey = isValid(date) ? format(date, 'yyyy-MM-dd') : 'unknown';

    const existing = map.get(dateKey);
    if (existing) {
      existing.expenses.push(expense);
    } else {
      map.set(dateKey, {
        date,
        expenses: [expense],
      });
    }
  });

  // Convert to array, compute display date and total amount, sort descending
  const dateEntries = Array.from(map.entries()).sort((a, b) => {
    return b[1].date.getTime() - a[1].date.getTime();
  });

  return dateEntries.map(([dateKey, { date, expenses: groupExpenses }]) => {
    const totalAmount = groupExpenses.reduce((sum, item) => sum + item.amount, 0);
    const displayDate = isValid(date) ? formatExpenseDate(date) : 'Unknown Date';

    return {
      dateKey,
      displayDate,
      totalAmount,
      expenses: groupExpenses,
    };
  });
};
