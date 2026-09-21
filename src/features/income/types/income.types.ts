/**
 * Represents a monthly income record from the backend
 */
export interface MonthlyIncome {
  id: string;
  userId: string;
  year: number;
  month: number; // 1 - 12
  amount: number;
  source?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for recording or updating monthly income
 */
export interface CreateIncomePayload {
  year: number;
  month: number;
  amount: number;
  source?: string;
  note?: string;
}

/**
 * Payload for updating an existing monthly income
 */
export interface UpdateIncomePayload {
  amount?: number;
  source?: string;
  note?: string;
}

/**
 * Payment method breakdown for monthly expenses
 */
export interface PaymentBreakdown {
  cash: number;
  upi: number;
  other: number;
}

/**
 * Comprehensive financial summary for a given month
 */
export interface MonthlyFinancialSummary {
  year: number;
  month: number;
  monthlyIncome: number;
  hasIncomeRecorded: boolean;
  incomeRecord?: MonthlyIncome | null;
  totalExpenses: number;
  cashExpenses: number;
  upiExpenses: number;
  otherExpenses: number;
  savings: number; // monthlyIncome - totalExpenses
  savingsPercentage: number; // (savings / monthlyIncome) * 100, or 0 if monthlyIncome <= 0
  isDeficit: boolean; // totalExpenses > monthlyIncome (when income > 0) or totalExpenses > 0 (when income = 0)
  deficitAmount: number; // Math.max(0, totalExpenses - monthlyIncome)
}
