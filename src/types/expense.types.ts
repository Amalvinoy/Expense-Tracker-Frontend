import { PaymentMethod as NewPaymentMethod } from '@/features/expenses/types';

export type PaymentMethod = NewPaymentMethod;

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Housing & Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Personal Care'
  | 'Travel'
  | 'Investments'
  | 'Other';

/**
 * Backward-compatible ExpenseItem alias for Expense
 */
export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  receiptUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  byCategory: Record<ExpenseCategory, number>;
  currency: string;
}

export * from '@/features/expenses/types';
