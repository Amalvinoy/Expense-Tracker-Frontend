import { create } from 'zustand';
import {
  Expense,
  ExpenseFilters,
  CreateExpensePayload,
} from '@/features/expenses/types/expense.types';
import { expenseApi } from '@/services/api/expenseApi';
import { expenseStorage } from '@/services/storage';

interface ExpenseState {
  expenses: Expense[];
  filter: ExpenseFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadExpenses: () => Promise<void>;
  createExpense: (payload: CreateExpensePayload) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<CreateExpensePayload>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilter: (filter: ExpenseFilters) => void;
  resetFilter: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  filter: {},
  isLoading: false,
  error: null,

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await expenseApi.getExpenses(get().filter);
      set({ expenses: list, isLoading: false, error: null });
      expenseStorage.saveExpenses(list).catch(() => {});
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load expenses.';
      try {
        const stored = await expenseStorage.getExpenses();
        if (stored && stored.length > 0) {
          set({ expenses: stored, isLoading: false, error: null });
          return;
        }
      } catch {}
      set({ expenses: [], isLoading: false, error: errorMessage });
    }
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await expenseApi.createExpense(payload);
      const updatedExpenses = [newExpense, ...get().expenses];
      set({ expenses: updatedExpenses, isLoading: false, error: null });
      expenseStorage.saveExpenses(updatedExpenses).catch(() => {});
      return newExpense;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create expense.';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateExpense: async (id: string, payload: Partial<CreateExpensePayload>) => {
    try {
      const updatedItem = await expenseApi.updateExpense(id, payload);
      const updatedExpenses = get().expenses.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      );
      set({ expenses: updatedExpenses });
      expenseStorage.saveExpenses(updatedExpenses).catch(() => {});
    } catch (err: any) {
      console.warn('[ExpenseStore] Failed to update expense:', err);
      throw err;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      await expenseApi.deleteExpense(id);
      const updatedExpenses = get().expenses.filter((item) => item.id !== id);
      set({ expenses: updatedExpenses });
      expenseStorage.saveExpenses(updatedExpenses).catch(() => {});
    } catch (err: any) {
      console.warn('[ExpenseStore] Failed to delete expense:', err);
      throw err;
    }
  },

  setFilter: (filter: ExpenseFilters) => set({ filter }),

  resetFilter: () => set({ filter: {} }),
}));
