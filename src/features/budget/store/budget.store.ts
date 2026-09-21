import { create } from 'zustand';
import {
  Budget,
  CreateBudgetPayload,
} from '../types/budget.types';
import { DEFAULT_MONTHLY_TOTAL_BUDGET } from '../constants/budget.constants';
import { budgetApi } from '@/services/api/budgetApi';
import { budgetStorage } from '@/services/storage';

const getInitialMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

interface BudgetState {
  selectedMonth: string; // 'YYYY-MM'
  monthlyTotalBudget: number;
  monthlyTotalId?: string;
  categoryBudgets: Budget[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedMonth: (month: string) => Promise<void>;
  loadBudgets: (month?: string) => Promise<void>;
  setMonthlyTotalBudget: (amount: number, month?: string) => Promise<void>;
  addCategoryBudget: (payload: CreateBudgetPayload) => Promise<Budget>;
  updateCategoryBudget: (id: string, amount: number) => Promise<void>;
  deleteCategoryBudget: (id: string) => Promise<void>;
  deleteMonthlyTotalBudget: (month?: string) => Promise<void>;
  resetBudgets: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  selectedMonth: getInitialMonthKey(),
  monthlyTotalBudget: DEFAULT_MONTHLY_TOTAL_BUDGET,
  monthlyTotalId: undefined,
  categoryBudgets: [],
  isLoading: false,
  error: null,

  setSelectedMonth: async (month: string) => {
    set({ selectedMonth: month });
    await get().loadBudgets(month);
  },

  loadBudgets: async (month?: string) => {
    const targetMonth = month || get().selectedMonth || getInitialMonthKey();
    set({ isLoading: true, error: null });
    try {
      const state = await budgetApi.getBudget(targetMonth);
      set({
        selectedMonth: targetMonth,
        monthlyTotalBudget: state.monthlyTotal,
        monthlyTotalId: state.monthlyTotalId,
        categoryBudgets: state.categoryBudgets,
        isLoading: false,
        error: null,
      });
      // Save cache
      budgetStorage.saveMonthlyTotalBudget(state.monthlyTotal).catch(() => {});
      budgetStorage.saveCategoryBudgets(state.categoryBudgets).catch(() => {});
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load budgets.';
      set({
        monthlyTotalBudget: 0,
        monthlyTotalId: undefined,
        categoryBudgets: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  setMonthlyTotalBudget: async (amount: number, month?: string) => {
    const targetMonth = month || get().selectedMonth || getInitialMonthKey();
    set({ monthlyTotalBudget: amount });
    try {
      const result = await budgetApi.updateMonthlyBudget(amount, targetMonth);
      set({ monthlyTotalId: result.id, monthlyTotalBudget: result.amount });
    } catch (err) {
      console.warn('[BudgetStore] Failed to sync monthly total budget with backend:', err);
    }
    budgetStorage.saveMonthlyTotalBudget(amount).catch(() => {});
  },

  addCategoryBudget: async (payload: CreateBudgetPayload): Promise<Budget> => {
    const targetMonth = payload.month || get().selectedMonth || getInitialMonthKey();
    const resolvedPayload: CreateBudgetPayload = {
      ...payload,
      month: targetMonth,
    };

    let savedBudget: Budget;
    try {
      savedBudget = await budgetApi.saveCategoryBudget(resolvedPayload);
    } catch (err) {
      console.warn('[BudgetStore] Failed to save category budget to backend, creating fallback:', err);
      const now = new Date().toISOString();
      savedBudget = {
        id: `bgt_${payload.categoryId || Date.now()}`,
        type: 'category',
        amount: payload.amount,
        categoryId: payload.categoryId,
        categoryName: payload.categoryName || 'Category',
        categoryIcon: payload.categoryIcon || 'shape-outline',
        categoryColor: payload.categoryColor || '#2563EB',
        categoryBg: payload.categoryBg || '#EFF6FF',
        month: targetMonth,
        createdAt: now,
        updatedAt: now,
      };
    }

    const existing = get().categoryBudgets.find(
      (b) => b.categoryId === payload.categoryId || b.id === savedBudget.id
    );
    const updated = existing
      ? get().categoryBudgets.map((b) => (b.id === existing.id ? savedBudget : b))
      : [...get().categoryBudgets, savedBudget];

    set({ categoryBudgets: updated });
    budgetStorage.saveCategoryBudgets(updated).catch(() => {});
    return savedBudget;
  },

  updateCategoryBudget: async (id: string, amount: number) => {
    const budget = get().categoryBudgets.find((b) => b.id === id);
    if (budget) {
      await get().addCategoryBudget({
        type: 'category',
        amount,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        categoryIcon: budget.categoryIcon,
        categoryColor: budget.categoryColor,
        categoryBg: budget.categoryBg,
        month: budget.month || get().selectedMonth,
      });
    }
  },

  deleteCategoryBudget: async (id: string) => {
    try {
      await budgetApi.deleteCategoryBudget(id);
    } catch (err) {
      console.warn('[BudgetStore] Failed to delete budget from backend:', err);
    }
    const updated = get().categoryBudgets.filter((b) => b.id !== id);
    set({ categoryBudgets: updated });
    budgetStorage.saveCategoryBudgets(updated).catch(() => {});
  },

  deleteMonthlyTotalBudget: async (month?: string) => {
    const targetMonth = month || get().selectedMonth || getInitialMonthKey();
    try {
      await budgetApi.deleteMonthlyBudget(get().monthlyTotalId, targetMonth);
    } catch (err) {
      console.warn('[BudgetStore] Failed to reset total budget on backend:', err);
    }
    set({ monthlyTotalBudget: 0, monthlyTotalId: undefined });
    budgetStorage.saveMonthlyTotalBudget(0).catch(() => {});
  },

  resetBudgets: async () => {
    set({
      monthlyTotalBudget: 0,
      monthlyTotalId: undefined,
      categoryBudgets: [],
    });
    await Promise.all([
      budgetStorage.saveMonthlyTotalBudget(0),
      budgetStorage.saveCategoryBudgets([]),
    ]);
  },
}));
