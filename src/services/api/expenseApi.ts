import { apiClient } from './apiClient';
import {
  Expense,
  ExpenseFilters,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '@/features/expenses/types/expense.types';
import { normalizeExpense } from '@/features/expenses/utils/expense.utils';

export { normalizeExpense };

/**
 * Expense API Service
 * Handles expense CRUD operations with backend endpoints.
 */
export const expenseApi = {
  /**
   * Fetch all expenses with optional query filters
   */
  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const res = await apiClient.get<any>('/expenses', { params: filters });
    let rawList: any[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (Array.isArray(res?.data?.expenses)) {
      rawList = res.data.expenses;
    } else if (Array.isArray(res?.expenses)) {
      rawList = res.expenses;
    } else if (Array.isArray(res?.data)) {
      rawList = res.data;
    }

    return rawList.map(normalizeExpense);
  },

  /**
   * Fetch single expense by unique ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    const res = await apiClient.get<any>(`/expenses/${id}`);
    const raw = res?.data?.expense || res?.expense || res?.data || res;
    if (!raw) {
      throw new Error(`Expense with id "${id}" not found.`);
    }
    return normalizeExpense(raw);
  },

  /**
   * Create a new expense record
   */
  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
    if (!payload.categoryId || !OBJECT_ID_REGEX.test(payload.categoryId)) {
      throw new Error(
        `Invalid category ID format: "${payload.categoryId}". Must be a 24-character hexadecimal ObjectId.`
      );
    }

    const body = {
      amount: payload.amount,
      categoryId: payload.categoryId,
      categoryNameSnapshot: payload.categoryName,
      paymentMethod: payload.paymentMethod,
      note: payload.note,
      date: payload.date,
    };
    const res = await apiClient.post<any>('/expenses', body);
    const raw = res?.data?.expense || res?.expense || res?.data || res;
    return normalizeExpense(raw);
  },

  /**
   * Update an existing expense record
   */
  async updateExpense(
    id: string,
    payload: Partial<CreateExpensePayload> | UpdateExpensePayload
  ): Promise<Expense> {
    const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
    if (payload.categoryId && !OBJECT_ID_REGEX.test(payload.categoryId)) {
      throw new Error(
        `Invalid category ID format: "${payload.categoryId}". Must be a 24-character hexadecimal ObjectId.`
      );
    }

    const body: any = { ...payload };
    if (payload.categoryName && !(payload as any).categoryNameSnapshot) {
      body.categoryNameSnapshot = payload.categoryName;
    }
    const res = await apiClient.put<any>(`/expenses/${id}`, body);
    const raw = res?.data?.expense || res?.expense || res?.data || res;
    return normalizeExpense(raw);
  },

  /**
   * Delete an expense by ID
   */
  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },
};
