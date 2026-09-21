import { Expense } from '@/features/expenses/types/expense.types';
import { Budget } from '@/features/budget/types/budget.types';
import {
  SpendingInsightItem,
  SpendingInsightsReport,
} from './spending-insights.types';

export class SpendingInsightsService {
  /**
   * Helper to format YYYY-MM-DD into a short readable date (e.g. "Sep 12")
   */
  public formatDateLabel(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  /**
   * Get current month key in format "YYYY-MM"
   */
  public getMonthKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get previous month key in format "YYYY-MM"
   */
  public getPreviousMonthKey(date: Date = new Date()): string {
    const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return this.getMonthKey(prev);
  }

  /**
   * 1. Highest Spending Category Insight
   */
  public calculateHighestCategory(
    monthExpenses: Expense[],
    totalMonthSpent: number,
    currencySymbol: string
  ): SpendingInsightItem | null {
    if (monthExpenses.length === 0 || totalMonthSpent <= 0) return null;

    const categoryMap: Record<string, { name: string; amount: number; icon?: string }> = {};

    for (const exp of monthExpenses) {
      const name = exp.categoryName || 'General';
      if (!categoryMap[name]) {
        categoryMap[name] = {
          name,
          amount: 0,
          icon: exp.categoryIcon,
        };
      }
      categoryMap[name].amount += exp.amount;
    }

    const sorted = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
    const top = sorted[0];

    if (!top || top.amount <= 0) return null;

    const pct = Math.round((top.amount / totalMonthSpent) * 100);
    const formattedAmount = `${currencySymbol}${top.amount.toLocaleString()}`;

    return {
      id: 'insight_highest_category',
      type: 'highest_category',
      title: 'Top Expense Category',
      message: `You spent ${formattedAmount} on ${top.name} this month.`,
      detail: `${pct}% of your total monthly expenditure was in this category.`,
      icon: top.icon || 'tag-outline',
      impact: pct > 45 ? 'warning' : 'neutral',
      highlightValue: formattedAmount,
      categoryName: top.name,
      categoryIcon: top.icon,
    };
  }

  /**
   * 2. Highest Spending Day Insight
   */
  public calculateHighestDay(
    monthExpenses: Expense[],
    currencySymbol: string
  ): SpendingInsightItem | null {
    if (monthExpenses.length === 0) return null;

    const dayMap: Record<string, { amount: number; count: number; date: string }> = {};

    for (const exp of monthExpenses) {
      const dateKey = exp.date.substring(0, 10);
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { amount: 0, count: 0, date: dateKey };
      }
      dayMap[dateKey].amount += exp.amount;
      dayMap[dateKey].count += 1;
    }

    const sortedDays = Object.values(dayMap).sort((a, b) => b.amount - a.amount);
    const topDay = sortedDays[0];

    if (!topDay || topDay.amount <= 0) return null;

    const formattedDate = this.formatDateLabel(topDay.date);
    const formattedAmount = `${currencySymbol}${topDay.amount.toLocaleString()}`;

    return {
      id: 'insight_highest_day',
      type: 'highest_day',
      title: 'Peak Spending Day',
      message: `Your peak spending day was ${formattedDate} (${formattedAmount}).`,
      detail: `Total of ${topDay.count} transaction${topDay.count > 1 ? 's' : ''} recorded on this single day.`,
      icon: 'calendar-star',
      impact: 'neutral',
      highlightValue: formattedAmount,
      dateKey: topDay.date,
    };
  }

  /**
   * 3. Average Daily Spending Insight
   */
  public calculateDailyAverage(
    totalMonthSpent: number,
    referenceDate: Date,
    currencySymbol: string
  ): SpendingInsightItem | null {
    const elapsedDays = Math.max(1, referenceDate.getDate());
    const dailyAvg = Math.round(totalMonthSpent / elapsedDays);
    const formattedDaily = `${currencySymbol}${dailyAvg.toLocaleString()}`;

    return {
      id: 'insight_daily_average',
      type: 'daily_average',
      title: 'Average Daily Spend',
      message: `Your average daily spending is ${formattedDaily}.`,
      detail: `Calculated over the first ${elapsedDays} day${elapsedDays > 1 ? 's' : ''} of this month.`,
      icon: 'calculator-variant-outline',
      impact: 'neutral',
      highlightValue: formattedDaily,
    };
  }

  /**
   * 4. Spending Compared with Previous Period (Month-over-Month proportional window)
   */
  public calculatePeriodComparison(
    allExpenses: Expense[],
    currentMonthKey: string,
    previousMonthKey: string,
    currentDayOfMonth: number,
    currencySymbol: string
  ): SpendingInsightItem | null {
    // Current month expenses up to current day
    const currentWindowExpenses = allExpenses.filter((e) => {
      if (!e.date.startsWith(currentMonthKey)) return false;
      const day = parseInt(e.date.substring(8, 10), 10);
      return day <= currentDayOfMonth;
    });
    const currentSpent = currentWindowExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Previous month expenses up to same day of month for fair comparison
    const prevWindowExpenses = allExpenses.filter((e) => {
      if (!e.date.startsWith(previousMonthKey)) return false;
      const day = parseInt(e.date.substring(8, 10), 10);
      return day <= currentDayOfMonth;
    });
    const prevSpent = prevWindowExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (prevSpent <= 0 && currentSpent <= 0) {
      return null;
    }

    const diff = currentSpent - prevSpent;
    const absDiff = Math.abs(diff);
    const formattedDiff = `${currencySymbol}${absDiff.toLocaleString()}`;

    if (prevSpent === 0) {
      return {
        id: 'insight_period_comparison',
        type: 'period_comparison',
        title: 'Monthly Comparison',
        message: `You spent ${currencySymbol}${currentSpent.toLocaleString()} so far this month.`,
        detail: 'No previous period transactions recorded for proportional comparison.',
        icon: 'chart-timeline-variant-shimmer',
        impact: 'neutral',
        highlightValue: `${currencySymbol}${currentSpent.toLocaleString()}`,
      };
    }

    const pctChange = Math.round((absDiff / prevSpent) * 100);

    if (diff > 0) {
      return {
        id: 'insight_period_comparison',
        type: 'period_comparison',
        title: 'Month-over-Month Pace',
        message: `You spent ${formattedDiff} more this month than last month.`,
        detail: `Spending is up ${pctChange}% compared to the same day range last month.`,
        icon: 'trending-up',
        impact: pctChange > 20 ? 'warning' : 'neutral',
        highlightValue: `+${formattedDiff}`,
      };
    } else if (diff < 0) {
      return {
        id: 'insight_period_comparison',
        type: 'period_comparison',
        title: 'Month-over-Month Pace',
        message: `You spent ${formattedDiff} less this month than last month.`,
        detail: `Great job! Spending is down ${pctChange}% compared to the same period last month.`,
        icon: 'trending-down',
        impact: 'positive',
        highlightValue: `-${formattedDiff}`,
      };
    } else {
      return {
        id: 'insight_period_comparison',
        type: 'period_comparison',
        title: 'Month-over-Month Pace',
        message: `Your spending matches your spending at this exact date last month.`,
        detail: `Both periods are identical at ${currencySymbol}${currentSpent.toLocaleString()}.`,
        icon: 'equal',
        impact: 'neutral',
      };
    }
  }

  /**
   * 5. Budget Usage & Pace Insight
   */
  public calculateBudgetUsage(
    totalMonthSpent: number,
    monthlyBudget: number,
    referenceDate: Date,
    currencySymbol: string
  ): SpendingInsightItem | null {
    if (monthlyBudget <= 0) return null;

    const daysInMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0
    ).getDate();
    const currentDay = referenceDate.getDate();
    const remainingDays = Math.max(0, daysInMonth - currentDay);

    const budgetPct = Math.round((totalMonthSpent / monthlyBudget) * 100);
    const monthPacePct = Math.round((currentDay / daysInMonth) * 100);
    const formattedBudget = `${currencySymbol}${monthlyBudget.toLocaleString()}`;

    let impact: 'positive' | 'warning' | 'negative' | 'neutral' = 'neutral';
    let detail = '';

    if (budgetPct >= 100) {
      impact = 'negative';
      detail = `Exceeded budget limit by ${budgetPct - 100}% with ${remainingDays} days still remaining.`;
    } else if (budgetPct > monthPacePct + 15) {
      impact = 'warning';
      detail = `You have used ${budgetPct}% of your budget while only ${monthPacePct}% of the month has passed.`;
    } else {
      impact = 'positive';
      detail = `Well paced! ${remainingDays} day${remainingDays === 1 ? '' : 's'} remaining in this billing cycle.`;
    }

    return {
      id: 'insight_budget_usage',
      type: 'budget_usage',
      title: 'Budget Consumption',
      message: `You've used ${budgetPct}% of your ${formattedBudget} monthly budget.`,
      detail,
      icon: budgetPct >= 100 ? 'alert-circle' : 'wallet-outline',
      impact,
      highlightValue: `${budgetPct}%`,
    };
  }

  /**
   * 6. Unusual High Spending Day Detection
   */
  public calculateUnusualSpikes(
    monthExpenses: Expense[],
    dailyAverage: number,
    currencySymbol: string
  ): SpendingInsightItem | null {
    if (monthExpenses.length < 3 || dailyAverage <= 0) return null;

    const dayTotals: Record<string, number> = {};
    for (const exp of monthExpenses) {
      const dateKey = exp.date.substring(0, 10);
      dayTotals[dateKey] = (dayTotals[dateKey] || 0) + exp.amount;
    }

    // A day is considered an unusual spike if spending is >= 2.2x the daily average
    // and significantly exceeds ₹500
    const spikeThreshold = Math.max(dailyAverage * 2.2, 500);

    const spikes = Object.entries(dayTotals)
      .map(([date, amount]) => ({
        date,
        amount,
        multiplier: Number((amount / dailyAverage).toFixed(1)),
      }))
      .filter((d) => d.amount >= spikeThreshold)
      .sort((a, b) => b.amount - a.amount);

    if (spikes.length === 0) return null;

    const topSpike = spikes[0];
    const formattedDate = this.formatDateLabel(topSpike.date);
    const formattedAmount = `${currencySymbol}${topSpike.amount.toLocaleString()}`;

    return {
      id: 'insight_unusual_spike',
      type: 'unusual_spike',
      title: 'Unusual Spending Spike',
      message: `Unusual spike detected on ${formattedDate}: ${formattedAmount}.`,
      detail: `This was ${topSpike.multiplier}x higher than your daily average spend of ${currencySymbol}${dailyAverage.toLocaleString()}.`,
      icon: 'lightning-bolt',
      impact: 'warning',
      highlightValue: `${topSpike.multiplier}x avg`,
      dateKey: topSpike.date,
    };
  }

  /**
   * Main Generator: Produces all deterministic insights for the dashboard
   */
  public generateAllInsights(
    expenses: Expense[],
    monthlyBudget: number = 0,
    categoryBudgets: Budget[] = [],
    currencySymbol: string = '₹',
    referenceDate: Date = new Date()
  ): SpendingInsightsReport {
    const currentMonthKey = this.getMonthKey(referenceDate);
    const previousMonthKey = this.getPreviousMonthKey(referenceDate);
    const currentDay = referenceDate.getDate();

    // Filter current month expenses
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));
    const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyAverage = Math.round(totalMonthSpent / Math.max(1, currentDay));

    const insights: SpendingInsightItem[] = [];

    // 1. Highest Category
    const highestCategoryInsight = this.calculateHighestCategory(
      monthExpenses,
      totalMonthSpent,
      currencySymbol
    );
    if (highestCategoryInsight) insights.push(highestCategoryInsight);

    // 2. Highest Spending Day
    const highestDayInsight = this.calculateHighestDay(monthExpenses, currencySymbol);
    if (highestDayInsight) insights.push(highestDayInsight);

    // 3. Average Daily Spending
    const dailyAvgInsight = this.calculateDailyAverage(
      totalMonthSpent,
      referenceDate,
      currencySymbol
    );
    if (dailyAvgInsight) insights.push(dailyAvgInsight);

    // 4. Period Comparison (Month-over-Month)
    const periodCompInsight = this.calculatePeriodComparison(
      expenses,
      currentMonthKey,
      previousMonthKey,
      currentDay,
      currencySymbol
    );
    if (periodCompInsight) insights.push(periodCompInsight);

    // 5. Budget Usage (if monthly budget configured)
    if (monthlyBudget > 0) {
      const budgetUsageInsight = this.calculateBudgetUsage(
        totalMonthSpent,
        monthlyBudget,
        referenceDate,
        currencySymbol
      );
      if (budgetUsageInsight) insights.push(budgetUsageInsight);
    }

    // 6. Unusual Spending Spike
    const unusualSpikeInsight = this.calculateUnusualSpikes(
      monthExpenses,
      dailyAverage,
      currencySymbol
    );
    if (unusualSpikeInsight) insights.push(unusualSpikeInsight);

    return {
      insights,
      generatedAt: new Date().toISOString(),
      periodMonthKey: currentMonthKey,
      totalAnalyzedExpenses: monthExpenses.length,
      totalSpent: totalMonthSpent,
      dailyAverage,
      unusualSpikes: [],
    };
  }
}

export const spendingInsightsService = new SpendingInsightsService();
