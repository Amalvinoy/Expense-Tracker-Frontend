import { storageService } from '../storage.service';
import { STORAGE_KEYS } from '../storage.keys';
import { Expense } from '@/features/expenses/types/expense.types';
import { normalizeExpense } from '@/services/api/expenseApi';

/**
 * Local Expense Storage Repository.
 * Encapsulates offline caching and local persistence logic for expense entries.
 */
export const expenseStorage = {
  /**
   * Load cached expenses from local storage (returns empty array if none found).
   * Also migrates legacy storage keys if present.
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      // 1. Try primary storage key
      let stored = await storageService.getItem<Expense[]>(STORAGE_KEYS.EXPENSES);

      // 2. If not found, try legacy storage key
      if (!stored || !Array.isArray(stored) || stored.length === 0) {
        const legacy = await storageService.getItem<Expense[]>(STORAGE_KEYS.LEGACY_EXPENSES);
        if (legacy && Array.isArray(legacy) && legacy.length > 0) {
          stored = legacy;
          // Silently migrate to new key
          await storageService.setItem(STORAGE_KEYS.EXPENSES, stored);
        }
      }

      // 3. If valid array exists, return it with normalized domain model
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored.map(normalizeExpense);
      }

      return [];
    } catch (error) {
      console.warn('[ExpenseStorage] Error reading expenses from storage:', error);
      return [];
    }
  },

  /**
   * Persist complete expenses list to local storage.
   */
  async saveExpenses(expenses: Expense[]): Promise<boolean> {
    try {
      return await storageService.setItem(STORAGE_KEYS.EXPENSES, expenses);
    } catch (error) {
      console.error('[ExpenseStorage] Error persisting expenses:', error);
      return false;
    }
  },

  /**
   * Clear stored expenses.
   */
  async clearExpenses(): Promise<boolean> {
    return storageService.removeItem(STORAGE_KEYS.EXPENSES);
  },
};
