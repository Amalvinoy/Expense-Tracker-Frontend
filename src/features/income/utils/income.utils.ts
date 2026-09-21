import { Expense } from '@/features/expenses/types/expense.types';
import {
  MonthlyIncome,
  PaymentBreakdown,
  MonthlyFinancialSummary,
} from '../types/income.types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Returns formatted "Month YYYY" string, e.g. "September 2026"
 */
export function formatMonthYear(year: number, month: number): string {
  const monthIndex = Math.max(1, Math.min(12, month)) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

/**
 * Filter an array of expenses to only include those belonging to the given year and month (1-indexed)
 */
export function getMonthExpenses(
  expenses: Expense[],
  year: number,
  month: number
): Expense[] {
  return expenses.filter((exp) => {
    if (!exp.date) return false;
    const d = new Date(exp.date);
    if (isNaN(d.getTime())) return false;
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

/**
 * Aggregates monthly expenses by payment method into Cash, UPI, and Other
 */
export function calculatePaymentBreakdown(expenses: Expense[]): PaymentBreakdown {
  let cash = 0;
  let upi = 0;
  let other = 0;

  for (const exp of expenses) {
    const amount = typeof exp.amount === 'number' ? exp.amount : 0;
    const method = (exp.paymentMethod || '').trim().toUpperCase();

    if (method === 'CASH') {
      cash += amount;
    } else if (method === 'UPI') {
      upi += amount;
    } else {
      other += amount;
    }
  }

  return {
    cash: Math.round(cash * 100) / 100,
    upi: Math.round(upi * 100) / 100,
    other: Math.round(other * 100) / 100,
  };
}

/**
 * Calculates complete financial metrics for a target month
 */
export function calculateFinancialSummary(
  allExpenses: Expense[],
  incomeRecord: MonthlyIncome | null,
  year: number,
  month: number
): MonthlyFinancialSummary {
  const monthExpenses = getMonthExpenses(allExpenses, year, month);

  const totalExpenses = Math.round(
    monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) * 100
  ) / 100;

  const paymentBreakdown = calculatePaymentBreakdown(monthExpenses);

  const monthlyIncome = incomeRecord ? Math.round(incomeRecord.amount * 100) / 100 : 0;
  const hasIncomeRecorded = !!incomeRecord && incomeRecord.amount > 0;

  // Savings = Monthly Income - Total Expenses
  const savings = Math.round((monthlyIncome - totalExpenses) * 100) / 100;

  // Savings Percentage = (Savings / Monthly Income) * 100
  // Safe division: 0 if no income recorded or income is zero
  let savingsPercentage = 0;
  if (monthlyIncome > 0) {
    savingsPercentage = Math.round(((savings / monthlyIncome) * 100) * 10) / 10;
  }

  const isDeficit = totalExpenses > monthlyIncome;
  const deficitAmount = isDeficit
    ? Math.round((totalExpenses - monthlyIncome) * 100) / 100
    : 0;

  return {
    year,
    month,
    monthlyIncome,
    hasIncomeRecorded,
    incomeRecord,
    totalExpenses,
    cashExpenses: paymentBreakdown.cash,
    upiExpenses: paymentBreakdown.upi,
    otherExpenses: paymentBreakdown.other,
    savings,
    savingsPercentage,
    isDeficit,
    deficitAmount,
  };
}

/**
 * Formats a currency amount with Indian Rupee formatting
 */
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
