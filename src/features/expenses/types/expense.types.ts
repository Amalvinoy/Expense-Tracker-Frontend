/**
 * Payment Methods supported in the Expense Tracker
 */
export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Other';

/**
 * Category Model
 */
export interface ExpenseCategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

/**
 * Complete Expense Model
 */
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  paymentMethod: PaymentMethod;
  note?: string;
  date: string; // ISO 8601 string (e.g. 2026-09-19T12:00:00.000Z or YYYY-MM-DD)
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  categoryNameSnapshot?: string;
}

/**
 * Payload for creating a new expense
 */
export interface CreateExpensePayload {
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  paymentMethod: PaymentMethod;
  note?: string;
  date: string;
}

/**
 * Payload for updating an existing expense
 */
export interface UpdateExpensePayload {
  id: string;
  amount?: number;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  paymentMethod?: PaymentMethod;
  note?: string;
  date?: string;
}

/**
 * Filter criteria for queries
 */
export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  paymentMethods?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

/**
 * Grouped expenses by category
 */
export interface ExpensesByCategoryGroup {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  expenses: Expense[];
}

/**
 * Grouped expenses by calendar date
 */
export interface ExpensesByDateGroup {
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Today", "Yesterday", "Sep 19, 2026"
  totalAmount: number;
  expenses: Expense[];
}
