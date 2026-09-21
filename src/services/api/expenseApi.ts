import { apiClient } from './apiClient';
import {
  Expense,
  ExpenseFilters,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '@/features/expenses/types/expense.types';

/**
 * Normalizes raw backend expense payloads into the canonical frontend Expense domain model.
 * Maps backend `categoryNameSnapshot` to frontend `categoryName` and provides safe defaults.
 */
export function normalizeExpense(raw: any): Expense {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      userId: '',
      amount: 0,
      categoryId: '',
      categoryName: 'Other',
      categoryIcon: 'shape-outline',
      paymentMethod: 'Other',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const categoryName =
    raw.categoryName ||
    raw.categoryNameSnapshot ||
    raw.category?.name ||
    'Other';

  const categoryIcon =
    raw.categoryIcon ||
    raw.category?.icon ||
    'shape-outline';

  return {
    id: String(raw.id || raw._id || ''),
    userId: String(raw.userId || ''),
    amount: typeof raw.amount === 'number' ? raw.amount : Number(raw.amount) || 0,
    categoryId: String(raw.categoryId || raw.category?.id || ''),
    categoryName,
    categoryIcon,
    paymentMethod: raw.paymentMethod || 'Other',
    note: raw.note || undefined,
    date: raw.date ? new Date(raw.date).toISOString() : new Date().toISOString(),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
  };
}

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
