import {
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  differenceInCalendarDays,
  isWithinInterval,
} from 'date-fns';
import { Expense, PaymentMethod } from '@/features/expenses/types/expense.types';
import { Category } from '@/features/categories/types/category.types';
import {
  ReportTimeRange,
  DateRange,
  ReportSummaryMetrics,
  DailySpendingDataPoint,
  MonthlySpendingDataPoint,
  CategoryBreakdownItem,
  PaymentMethodBreakdownItem,
  ReportData,
} from '../types/report.types';

/**
 * Resolves Date objects and display label for a given preset or custom range
 */
export const getDateRangeForPreset = (
  preset: ReportTimeRange,
  customRange?: DateRange,
  referenceDate: Date = new Date()
): { start: Date; end: Date; label: string } => {
  switch (preset) {
    case 'this_month': {
      const start = startOfMonth(referenceDate);
      const end = endOfMonth(referenceDate);
      return {
        start,
        end,
        label: format(referenceDate, 'MMMM yyyy'),
      };
    }
    case 'last_month': {
      const prevMonthDate = subMonths(referenceDate, 1);
      const start = startOfMonth(prevMonthDate);
      const end = endOfMonth(prevMonthDate);
      return {
        start,
        end,
        label: format(prevMonthDate, 'MMMM yyyy'),
      };
    }
    case 'last_3_months': {
      const start = startOfMonth(subMonths(referenceDate, 2));
      const end = endOfMonth(referenceDate);
      return {
        start,
        end,
        label: `${format(start, 'MMM yyyy')} - ${format(end, 'MMM yyyy')}`,
      };
    }
    case 'custom': {
      if (customRange?.startDate && customRange?.endDate) {
        const start = startOfDay(parseISO(customRange.startDate));
        const end = endOfDay(parseISO(customRange.endDate));
        if (isValid(start) && isValid(end)) {
          return {
            start,
            end,
            label: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
          };
        }
      }
      // Fallback to this month
      const start = startOfMonth(referenceDate);
      const end = endOfMonth(referenceDate);
      return {
        start,
        end,
        label: format(referenceDate, 'MMMM yyyy'),
      };
    }
  }
};

/**
 * Filters a list of expenses to only include those within the given start and end date
 */
export const filterExpensesByDateRange = (
  expenses: Expense[],
  start: Date,
  end: Date
): Expense[] => {
  return expenses.filter((expense) => {
    try {
      const expenseDate = parseISO(expense.date);
      if (!isValid(expenseDate)) return false;
      return isWithinInterval(expenseDate, { start, end });
    } catch {
      return false;
    }
  });
};

/**
 * Calculates summary metrics (total, daily avg, highest day, highest category)
 */
export const calculateReportMetrics = (
  filteredExpenses: Expense[],
  dateRange: { start: Date; end: Date }
): ReportSummaryMetrics => {
  const totalSpending = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTransactions = filteredExpenses.length;

  const now = new Date();
  const effectiveEnd = dateRange.end > now ? now : dateRange.end;
  const daysDiff = differenceInCalendarDays(effectiveEnd, dateRange.start) + 1;
  const totalDaysInPeriod = Math.max(1, daysDiff);

  // Group by calendar day (YYYY-MM-DD) to find highest spending day
  const dailyTotalsMap: Record<string, { dateObj: Date; amount: number }> = {};
  filteredExpenses.forEach((exp) => {
    try {
      const d = parseISO(exp.date);
      if (!isValid(d)) return;
      const key = format(d, 'yyyy-MM-dd');
      if (!dailyTotalsMap[key]) {
        dailyTotalsMap[key] = { dateObj: d, amount: 0 };
      }
      dailyTotalsMap[key].amount += exp.amount;
    } catch {
      // ignore invalid
    }
  });

  const uniqueDaysWithExpenses = Object.keys(dailyTotalsMap).length;
  const dailyAverage = totalSpending / totalDaysInPeriod;

  // Find highest spending day
  let highestDay: ReportSummaryMetrics['highestSpendingDay'] = null;
  let maxDayAmount = -1;
  Object.entries(dailyTotalsMap).forEach(([key, val]) => {
    if (val.amount > maxDayAmount) {
      maxDayAmount = val.amount;
      highestDay = {
        date: key,
        displayDate: format(val.dateObj, 'MMM d, yyyy'),
        amount: val.amount,
      };
    }
  });

  // Group by category to find highest spending category
  const categoryTotalsMap: Record<
    string,
    { id: string; name: string; icon: string; color: string; amount: number }
  > = {};

  filteredExpenses.forEach((exp) => {
    const catName = exp.categoryName || 'Other';
    const key = exp.categoryId || catName.toLowerCase();
    if (!categoryTotalsMap[key]) {
      categoryTotalsMap[key] = {
        id: exp.categoryId,
        name: catName,
        icon: exp.categoryIcon || 'shape-outline',
        color: '#2563EB',
        amount: 0,
      };
    }
    categoryTotalsMap[key].amount += exp.amount;
  });

  let highestCategory: ReportSummaryMetrics['highestSpendingCategory'] = null;
  let maxCategoryAmount = -1;
  Object.values(categoryTotalsMap).forEach((val) => {
    if (val.amount > maxCategoryAmount) {
      maxCategoryAmount = val.amount;
      const percentage = totalSpending > 0 ? (val.amount / totalSpending) * 100 : 0;
      highestCategory = {
        id: val.id,
        name: val.name,
        icon: val.icon,
        color: val.color,
        backgroundColor: '#EFF6FF',
        amount: val.amount,
        percentage: Math.round(percentage * 10) / 10,
      };
    }
  });

  return {
    totalSpending,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    highestSpendingDay: highestDay,
    highestSpendingCategory: highestCategory,
    totalTransactions,
    daysWithExpenses: uniqueDaysWithExpenses,
    totalDaysInPeriod,
  };
};

/**
 * Builds chronological daily spending data points for the trend chart
 */
export const calculateDailySpendingData = (
  filteredExpenses: Expense[],
  start: Date,
  end: Date
): DailySpendingDataPoint[] => {
  try {
    const allDays = eachDayOfInterval({ start, end });
    // Map expenses by YYYY-MM-DD
    const dayMap: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      try {
        const d = parseISO(exp.date);
        if (isValid(d)) {
          const key = format(d, 'yyyy-MM-dd');
          dayMap[key] = (dayMap[key] || 0) + exp.amount;
        }
      } catch {
        // ignore
      }
    });

    return allDays.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      return {
        dateKey: key,
        label: format(day, 'd'),
        dayOfWeek: format(day, 'EEE'),
        amount: dayMap[key] || 0,
        fullDate: format(day, 'MMMM d, yyyy'),
      };
    });
  } catch {
    return [];
  }
};

/**
 * Computes monthly totals across the last 6 months for the comparison chart
 */
export const calculateMonthlySpendingData = (
  allExpenses: Expense[],
  monthsCount: number = 6,
  referenceDate: Date = new Date()
): MonthlySpendingDataPoint[] => {
  const months: MonthlySpendingDataPoint[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const monthDate = subMonths(referenceDate, i);
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);
    const monthKey = format(monthDate, 'yyyy-MM');

    // Filter expenses in this month
    const total = allExpenses.reduce((sum, exp) => {
      try {
        const expDate = parseISO(exp.date);
        if (isValid(expDate) && isWithinInterval(expDate, { start: mStart, end: mEnd })) {
          return sum + exp.amount;
        }
        return sum;
      } catch {
        return sum;
      }
    }, 0);

    months.push({
      monthKey,
      label: format(monthDate, 'MMM'),
      monthName: format(monthDate, 'MMMM'),
      amount: total,
      year: monthDate.getFullYear(),
    });
  }

  return months;
};

/**
 * Computes breakdown by category with percentages and colors
 */
export const calculateCategoryBreakdown = (
  filteredExpenses: Expense[],
  categories: Category[]
): CategoryBreakdownItem[] => {
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const catMap: Record<
    string,
    { id: string; name: string; icon: string; color: string; bg: string; amount: number; count: number }
  > = {};

  filteredExpenses.forEach((exp) => {
    const catName = exp.categoryName || 'Other';
    const key = exp.categoryId || catName.toLowerCase();
    if (!catMap[key]) {
      // Find metadata from categories list if available
      const matchedCat = categories.find(
        (c) =>
          (exp.categoryId && c.id === exp.categoryId) ||
          (c.name && c.name.toLowerCase() === catName.toLowerCase())
      );

      catMap[key] = {
        id: exp.categoryId,
        name: matchedCat?.name || catName,
        icon: matchedCat?.icon || exp.categoryIcon || 'shape-outline',
        color: matchedCat?.color || '#2563EB',
        bg: matchedCat?.backgroundColor || '#EFF6FF',
        amount: 0,
        count: 0,
      };
    }
    catMap[key].amount += exp.amount;
    catMap[key].count += 1;
  });

  const list: CategoryBreakdownItem[] = Object.values(catMap).map((item) => {
    const percentage = total > 0 ? (item.amount / total) * 100 : 0;
    return {
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      backgroundColor: item.bg,
      amount: item.amount,
      percentage: Math.round(percentage * 10) / 10,
      count: item.count,
    };
  });

  return list.sort((a, b) => b.amount - a.amount);
};

/**
 * Computes breakdown by payment method
 */
export const calculatePaymentMethodBreakdown = (
  filteredExpenses: Expense[]
): PaymentMethodBreakdownItem[] => {
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const methodMap: Record<
    string,
    { method: PaymentMethod; amount: number; count: number; icon: string }
  > = {};

  const paymentIconMap: Record<string, string> = {
    UPI: 'cellphone-wireless',
    Cash: 'cash-multiple',
    'Credit Card': 'credit-card-outline',
    'Debit Card': 'credit-card',
    'Bank Transfer': 'bank-transfer',
    Other: 'wallet-outline',
  };

  filteredExpenses.forEach((exp) => {
    const method = exp.paymentMethod;
    if (!methodMap[method]) {
      methodMap[method] = {
        method,
        amount: 0,
        count: 0,
        icon: paymentIconMap[method] || 'credit-card-outline',
      };
    }
    methodMap[method].amount += exp.amount;
    methodMap[method].count += 1;
  });

  const list: PaymentMethodBreakdownItem[] = Object.values(methodMap).map((item) => {
    const percentage = total > 0 ? (item.amount / total) * 100 : 0;
    return {
      method: item.method,
      amount: item.amount,
      percentage: Math.round(percentage * 10) / 10,
      count: item.count,
      icon: item.icon,
    };
  });

  return list.sort((a, b) => b.amount - a.amount);
};

/**
 * Generates the complete consolidated report data bundle
 */
export const generateCompleteReportData = (
  allExpenses: Expense[],
  categories: Category[],
  preset: ReportTimeRange,
  customRange?: DateRange
): ReportData => {
  const { start, end, label } = getDateRangeForPreset(preset, customRange);
  const filtered = filterExpensesByDateRange(allExpenses, start, end);

  const metrics = calculateReportMetrics(filtered, { start, end });
  const dailySpending = calculateDailySpendingData(filtered, start, end);
  const monthlySpending = calculateMonthlySpendingData(allExpenses, 6);
  const categoryBreakdown = calculateCategoryBreakdown(filtered, categories);
  const paymentMethodBreakdown = calculatePaymentMethodBreakdown(filtered);

  return {
    timeRange: preset,
    dateRangeLabel: label,
    metrics,
    dailySpending,
    monthlySpending,
    categoryBreakdown,
    paymentMethodBreakdown,
    filteredExpensesCount: filtered.length,
  };
};
