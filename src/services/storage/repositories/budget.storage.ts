import { storageService } from '../storage.service';
import { STORAGE_KEYS } from '../storage.keys';
import { Budget } from '@/features/budget/types/budget.types';
import {
  DEFAULT_MONTHLY_TOTAL_BUDGET,
  INITIAL_CATEGORY_BUDGETS,
} from '@/features/budget/constants/budget.constants';

export interface StoredBudgetState {
  monthlyTotalBudget: number;
  categoryBudgets: Budget[];
}

/**
 * Local Budget Storage Repository.
 * Encapsulates persistence logic for monthly and category budgets.
 */
export const budgetStorage = {
  /**
   * Load both monthly total budget and category-specific budgets.
   */
  async getBudgetState(): Promise<StoredBudgetState> {
    try {
      const [storedTotal, storedCategories] = await Promise.all([
        storageService.getItem<number>(STORAGE_KEYS.MONTHLY_TOTAL_BUDGET),
        storageService.getItem<Budget[]>(STORAGE_KEYS.CATEGORY_BUDGETS),
      ]);

      let resolvedTotal = storedTotal;
      let resolvedCategories = storedCategories;

      // Check legacy keys if needed
      if (typeof resolvedTotal !== 'number' || resolvedTotal <= 0) {
        const legacyTotal = await storageService.getItem<number>(STORAGE_KEYS.LEGACY_MONTHLY_TOTAL_BUDGET);
        if (typeof legacyTotal === 'number' && legacyTotal > 0) {
          resolvedTotal = legacyTotal;
          await storageService.setItem(STORAGE_KEYS.MONTHLY_TOTAL_BUDGET, resolvedTotal);
        }
      }

      if (!resolvedCategories || !Array.isArray(resolvedCategories) || resolvedCategories.length === 0) {
        const legacyCategories = await storageService.getItem<Budget[]>(STORAGE_KEYS.LEGACY_CATEGORY_BUDGETS);
        if (legacyCategories && Array.isArray(legacyCategories) && legacyCategories.length > 0) {
          resolvedCategories = legacyCategories;
          await storageService.setItem(STORAGE_KEYS.CATEGORY_BUDGETS, resolvedCategories);
        }
      }

      return {
        monthlyTotalBudget:
          typeof resolvedTotal === 'number' && resolvedTotal > 0
            ? resolvedTotal
            : DEFAULT_MONTHLY_TOTAL_BUDGET,
        categoryBudgets:
          resolvedCategories && Array.isArray(resolvedCategories) && resolvedCategories.length > 0
            ? resolvedCategories
            : INITIAL_CATEGORY_BUDGETS,
      };
    } catch (error) {
      console.warn('[BudgetStorage] Failed to load budgets, using defaults:', error);
      return {
        monthlyTotalBudget: DEFAULT_MONTHLY_TOTAL_BUDGET,
        categoryBudgets: INITIAL_CATEGORY_BUDGETS,
      };
    }
  },

  /**
   * Save monthly overall budget limit.
   */
  async saveMonthlyTotalBudget(amount: number): Promise<boolean> {
    try {
      return await storageService.setItem(STORAGE_KEYS.MONTHLY_TOTAL_BUDGET, amount);
    } catch (error) {
      console.error('[BudgetStorage] Failed to persist monthly total budget:', error);
      return false;
    }
  },

  /**
   * Save category-specific budgets array.
   */
  async saveCategoryBudgets(budgets: Budget[]): Promise<boolean> {
    try {
      return await storageService.setItem(STORAGE_KEYS.CATEGORY_BUDGETS, budgets);
    } catch (error) {
      console.error('[BudgetStorage] Failed to persist category budgets:', error);
      return false;
    }
  },
};
