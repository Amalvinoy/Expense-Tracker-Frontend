import { PaymentMethod } from '@/features/expenses/types/expense.types';

export type ReportTimeRange =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'custom';

export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface DayHighlight {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Sep 15, 2026"
  amount: number;
}

export interface CategoryHighlight {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  amount: number;
  percentage: number;
}

export interface ReportSummaryMetrics {
  totalSpending: number;
  dailyAverage: number;
  highestSpendingDay: DayHighlight | null;
  highestSpendingCategory: CategoryHighlight | null;
  totalTransactions: number;
  daysWithExpenses: number;
  totalDaysInPeriod: number;
}

export interface DailySpendingDataPoint {
  dateKey: string; // YYYY-MM-DD
  label: string; // e.g. "19" or "Sep 19"
  dayOfWeek: string; // e.g. "Mon"
  amount: number;
  fullDate: string; // e.g. "September 19, 2026"
}

export interface MonthlySpendingDataPoint {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Sep" or "Sep 2026"
  monthName: string; // e.g. "September"
  amount: number;
  year: number;
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface PaymentMethodBreakdownItem {
  method: PaymentMethod;
  amount: number;
  percentage: number;
  count: number;
  icon: string;
}

export interface ReportData {
  timeRange: ReportTimeRange;
  dateRangeLabel: string;
  metrics: ReportSummaryMetrics;
  dailySpending: DailySpendingDataPoint[];
  monthlySpending: MonthlySpendingDataPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
  filteredExpensesCount: number;
}
