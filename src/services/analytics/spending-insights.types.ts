/**
 * Spending Insights Types & Interfaces
 * Purely deterministic calculation models for personal financial insights.
 */

export type SpendingInsightType =
  | 'highest_category'
  | 'highest_day'
  | 'daily_average'
  | 'period_comparison'
  | 'budget_usage'
  | 'unusual_spike';

export type InsightImpact = 'positive' | 'warning' | 'negative' | 'neutral';

export interface SpendingInsightItem {
  id: string;
  type: SpendingInsightType;
  title: string;
  message: string;
  detail?: string;
  icon: string;
  impact: InsightImpact;
  highlightValue?: string;
  categoryName?: string;
  categoryIcon?: string;
  dateKey?: string;
}

export interface SpendingInsightsReport {
  insights: SpendingInsightItem[];
  generatedAt: string; // ISO string
  periodMonthKey: string; // YYYY-MM
  totalAnalyzedExpenses: number;
  totalSpent: number;
  dailyAverage: number;
  highestCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
  highestDay?: {
    date: string;
    dateFormatted: string;
    amount: number;
    count: number;
  };
  previousPeriodComparison?: {
    currentSpent: number;
    previousSpent: number;
    difference: number;
    percentageChange: number;
    direction: 'higher' | 'lower' | 'equal';
  };
  unusualSpikes: {
    date: string;
    dateFormatted: string;
    amount: number;
    multiplierOfAverage: number;
  }[];
}
