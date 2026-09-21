import { apiClient } from './apiClient';
import {
  Budget,
  CreateBudgetPayload,
} from '@/features/budget/types/budget.types';

export interface BudgetOverviewResponse {
  monthlyTotal: number;
  monthlyTotalId?: string;
  categoryBudgets: Budget[];
}

function parseYearMonth(monthStr?: string): { year: number; month: number; monthKey: string } {
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    const parts = monthStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    return { year, month, monthKey: `${year}-${String(month).padStart(2, '0')}` };
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return { year, month, monthKey: `${year}-${String(month).padStart(2, '0')}` };
}

/**
 * Budget API Service
 * Handles month-scoped budget limits and category budget allocations via backend endpoints.
 */
export const budgetApi = {
  /**
   * Fetch monthly total and category budgets from backend for a specific month (YYYY-MM).
   * Defaults to current month if omitted.
   */
  async getBudget(monthStr?: string): Promise<BudgetOverviewResponse> {
    const { year, month } = parseYearMonth(monthStr);

    try {
      const res = await apiClient.get<any>('/budgets/progress', {
        params: { year, month },
      });
      const data = res?.data || res;
      if (data && (data.totalBudget !== undefined || data.categoryBudgets !== undefined)) {
        const monthlyTotal = data.totalBudget?.budget?.amount ?? 0;
        const monthlyTotalId = data.totalBudget?.budget?.id;
        const categoryBudgets: Budget[] = (data.categoryBudgets || []).map((cp: any) => ({
          id: cp.budget.id,
          type: 'category' as const,
          amount: cp.budget.amount,
          categoryId: cp.budget.categoryId,
          categoryName: cp.category?.name || cp.budget.categoryName || 'Category',
          categoryIcon: cp.category?.icon || cp.budget.categoryIcon || 'shape-outline',
          categoryColor: cp.category?.color || cp.budget.categoryColor || '#2563EB',
          categoryBg: cp.category?.backgroundColor || cp.budget.categoryBg || '#EFF6FF',
          month: `${cp.budget.year}-${String(cp.budget.month).padStart(2, '0')}`,
          createdAt: cp.budget.createdAt || new Date().toISOString(),
          updatedAt: cp.budget.updatedAt || new Date().toISOString(),
        }));
        return { monthlyTotal, monthlyTotalId, categoryBudgets };
      }
    } catch {
      // Fallback to /budgets query endpoint
    }

    const listRes = await apiClient.get<any>('/budgets', { params: { year, month } });
    const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
    const totalItem = budgets.find((b: any) => (b.type === 'TOTAL' || b.type === 'total') && b.year === year && b.month === month);
    const catItems = budgets.filter((b: any) => (b.type === 'CATEGORY' || b.type === 'category') && b.year === year && b.month === month);

    return {
      monthlyTotal: totalItem ? totalItem.amount : 0,
      monthlyTotalId: totalItem ? totalItem.id : undefined,
      categoryBudgets: catItems.map((b: any) => ({
        id: b.id,
        type: 'category' as const,
        amount: b.amount,
        categoryId: b.categoryId,
        categoryName: b.categoryName || 'Category',
        categoryIcon: b.categoryIcon || 'shape-outline',
        categoryColor: b.categoryColor || '#2563EB',
        categoryBg: b.categoryBg || '#EFF6FF',
        month: `${b.year}-${String(b.month).padStart(2, '0')}`,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    };
  },

  /**
   * Update overall monthly spending cap for a specific month (YYYY-MM).
   */
  async updateMonthlyBudget(amount: number, monthStr?: string): Promise<{ id: string; amount: number }> {
    const { year, month } = parseYearMonth(monthStr);

    // 1. Check if total budget already exists for this year and month
    try {
      const listRes = await apiClient.get<any>('/budgets', { params: { year, month, type: 'TOTAL' } });
      const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
      const existing = budgets.find(
        (b: any) => (b.type === 'TOTAL' || b.type === 'total') && b.year === year && b.month === month
      );
      if (existing) {
        const updateRes = await apiClient.put<any>(`/budgets/${existing.id}`, { amount });
        const b = updateRes?.data?.budget || updateRes?.budget || updateRes?.data || updateRes;
        return { id: existing.id, amount: b?.amount ?? amount };
      }
    } catch {
      // Proceed to create
    }

    // 2. Create if not found
    try {
      const res = await apiClient.post<any>('/budgets', {
        type: 'TOTAL',
        amount,
        year,
        month,
      });
      const budget = res?.data?.budget || res?.budget || res?.data || res;
      return { id: budget?.id || '', amount: budget?.amount ?? amount };
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const listRes = await apiClient.get<any>('/budgets', { params: { year, month, type: 'TOTAL' } });
        const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
        const existing = budgets.find(
          (b: any) => (b.type === 'TOTAL' || b.type === 'total') && b.year === year && b.month === month
        );
        if (existing) {
          const updateRes = await apiClient.put<any>(`/budgets/${existing.id}`, { amount });
          const b = updateRes?.data?.budget || updateRes?.budget || updateRes?.data || updateRes;
          return { id: existing.id, amount: b?.amount ?? amount };
        }
      }
      throw err;
    }
  },

  /**
   * Create or update a category budget allocation for a specific month
   */
  async saveCategoryBudget(payload: CreateBudgetPayload): Promise<Budget> {
    const { year, month, monthKey } = parseYearMonth(payload.month);

    // 1. Check if category budget already exists for this period
    try {
      const listRes = await apiClient.get<any>('/budgets', {
        params: { year, month, type: 'CATEGORY', categoryId: payload.categoryId },
      });
      const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
      const existing = budgets.find(
        (b: any) =>
          (b.type === 'CATEGORY' || b.type === 'category') &&
          b.categoryId === payload.categoryId &&
          b.year === year &&
          b.month === month
      );
      if (existing) {
        const updateRes = await apiClient.put<any>(`/budgets/${existing.id}`, { amount: payload.amount });
        const b = updateRes?.data?.budget || updateRes?.budget || updateRes?.data || updateRes;
        return {
          id: existing.id,
          type: 'category',
          amount: b?.amount ?? payload.amount,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName || 'Category',
          categoryIcon: payload.categoryIcon || 'shape-outline',
          categoryColor: payload.categoryColor || '#2563EB',
          categoryBg: payload.categoryBg || '#EFF6FF',
          month: monthKey,
          createdAt: b?.createdAt || existing.createdAt || new Date().toISOString(),
          updatedAt: b?.updatedAt || new Date().toISOString(),
        };
      }
    } catch {
      // Proceed to create
    }

    try {
      const res = await apiClient.post<any>('/budgets', {
        type: 'CATEGORY',
        amount: payload.amount,
        categoryId: payload.categoryId,
        year,
        month,
      });
      const b = res?.data?.budget || res?.budget || res?.data || res;
      return {
        id: b?.id || `bgt_${payload.categoryId}_${Date.now()}`,
        type: 'category',
        amount: b?.amount ?? payload.amount,
        categoryId: payload.categoryId,
        categoryName: payload.categoryName || 'Category',
        categoryIcon: payload.categoryIcon || 'shape-outline',
        categoryColor: payload.categoryColor || '#2563EB',
        categoryBg: payload.categoryBg || '#EFF6FF',
        month: monthKey,
        createdAt: b?.createdAt || new Date().toISOString(),
        updatedAt: b?.updatedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const listRes = await apiClient.get<any>('/budgets', {
          params: { year, month, type: 'CATEGORY', categoryId: payload.categoryId },
        });
        const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
        const existing = budgets.find(
          (b: any) =>
            (b.type === 'CATEGORY' || b.type === 'category') &&
            b.categoryId === payload.categoryId &&
            b.year === year &&
            b.month === month
        );
        if (existing) {
          const updateRes = await apiClient.put<any>(`/budgets/${existing.id}`, { amount: payload.amount });
          const b = updateRes?.data?.budget || updateRes?.budget || updateRes?.data || updateRes;
          return {
            id: existing.id,
            type: 'category',
            amount: b?.amount ?? payload.amount,
            categoryId: payload.categoryId,
            categoryName: payload.categoryName || 'Category',
            categoryIcon: payload.categoryIcon || 'shape-outline',
            categoryColor: payload.categoryColor || '#2563EB',
            categoryBg: payload.categoryBg || '#EFF6FF',
            month: monthKey,
            createdAt: b?.createdAt || existing.createdAt || new Date().toISOString(),
            updatedAt: b?.updatedAt || new Date().toISOString(),
          };
        }
      }
      throw err;
    }
  },

  /**
   * Delete category budget allocation
   */
  async deleteCategoryBudget(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },

  /**
   * Delete or reset monthly total budget for a specific month
   */
  async deleteMonthlyBudget(budgetId?: string, monthStr?: string): Promise<void> {
    if (budgetId && budgetId !== 'total_budget') {
      try {
        await apiClient.delete(`/budgets/${budgetId}`);
        return;
      } catch {}
    }

    const { year, month } = parseYearMonth(monthStr);
    try {
      const listRes = await apiClient.get<any>('/budgets', { params: { year, month, type: 'TOTAL' } });
      const budgets: any[] = listRes?.data?.budgets || listRes?.budgets || [];
      const existing = budgets.find(
        (b: any) => (b.type === 'TOTAL' || b.type === 'total') && b.year === year && b.month === month
      );
      if (existing) {
        await apiClient.delete(`/budgets/${existing.id}`);
      }
    } catch {}
  },
};
