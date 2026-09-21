import { create } from 'zustand';
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryDeleteValidation,
} from '../types/category.types';
import { categoryApi } from '@/services/api/categoryApi';
import { categoryStorage } from '@/services/storage';
import { useExpenseStore } from '@/store/expense.store';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<void>;
  toggleCategoryActive: (id: string) => Promise<void>;
  canDeleteCategory: (id: string) => CategoryDeleteValidation;
  deleteCategory: (id: string) => Promise<CategoryDeleteValidation>;
  resetToDefaults: () => Promise<void>;
  getActiveCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiCategories = await categoryApi.getCategories();
      const validApi = (apiCategories || []).filter(
        (c) => c && typeof c.id === 'string' && OBJECT_ID_REGEX.test(c.id)
      );

      if (validApi.length > 0) {
        set({ categories: validApi, isLoading: false, error: null });
        categoryStorage.saveCategories(validApi).catch(() => {});
        return;
      }

      // Fallback to validated local storage
      const stored = await categoryStorage.getCategories();
      const validStored = (stored || []).filter(
        (c) => c && typeof c.id === 'string' && OBJECT_ID_REGEX.test(c.id)
      );
      set({
        categories: validStored,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.warn('[CategoryStore] Failed to load categories from API, checking local storage:', err);
      try {
        const stored = await categoryStorage.getCategories();
        const validStored = (stored || []).filter(
          (c) => c && typeof c.id === 'string' && OBJECT_ID_REGEX.test(c.id)
        );
        set({
          categories: validStored,
          isLoading: false,
          error: null,
        });
      } catch {
        set({ categories: [], isLoading: false, error: err?.message || 'Failed to load categories.' });
      }
    }
  },

  addCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    // Strictly require backend-created category with valid MongoDB ObjectId
    const newCategory = await categoryApi.createCategory(payload);
    if (!newCategory || !newCategory.id || !OBJECT_ID_REGEX.test(newCategory.id)) {
      throw new Error(
        `Failed to create category on backend: Received invalid category ID "${newCategory?.id}".`
      );
    }

    const updated = [...get().categories, newCategory];
    set({ categories: updated });

    categoryStorage.saveCategories(updated).catch((err) => {
      console.warn('[CategoryStore] Failed to persist new category:', err);
    });

    return newCategory;
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
    const updatedCategory = await categoryApi.updateCategory(id, payload);
    const updated = get().categories.map((cat) => (cat.id === id ? updatedCategory : cat));

    set({ categories: updated });
    categoryStorage.saveCategories(updated).catch((err) => {
      console.warn('[CategoryStore] Failed to persist updated categories:', err);
    });
  },

  toggleCategoryActive: async (id: string) => {
    const target = get().categories.find((c) => c.id === id);
    if (!target) return;

    const newActiveState = !target.isActive;
    const updatedCategory = await categoryApi.updateCategory(id, { isActive: newActiveState });
    const updated = get().categories.map((cat) => (cat.id === id ? updatedCategory : cat));

    set({ categories: updated });
    categoryStorage.saveCategories(updated).catch((err) => {
      console.warn('[CategoryStore] Failed to persist category active status:', err);
    });
  },

  canDeleteCategory: (id: string): CategoryDeleteValidation => {
    const category = get().categories.find((c) => c.id === id);
    if (!category) {
      return { canDelete: false, expenseCount: 0, message: 'Category does not exist.' };
    }

    if (category.isDefault) {
      return {
        canDelete: false,
        expenseCount: 0,
        message: 'System default categories are protected and cannot be deleted.',
      };
    }

    // Check against all recorded expenses in useExpenseStore
    const expenses = useExpenseStore.getState().expenses;
    const matchingExpenses = expenses.filter(
      (e) => e.categoryId === id || e.categoryName.toLowerCase() === category.name.toLowerCase()
    );

    if (matchingExpenses.length > 0) {
      return {
        canDelete: false,
        expenseCount: matchingExpenses.length,
        message: `Cannot delete "${category.name}" because it is currently used by ${matchingExpenses.length} expense transaction(s). Please reassign or delete those expenses first.`,
      };
    }

    return {
      canDelete: true,
      expenseCount: 0,
    };
  },

  deleteCategory: async (id: string): Promise<CategoryDeleteValidation> => {
    const validation = get().canDeleteCategory(id);
    if (!validation.canDelete) {
      return validation;
    }

    try {
      await categoryApi.deleteCategory(id);
      const updated = get().categories.filter((cat) => cat.id !== id);
      set({ categories: updated });

      await categoryStorage.saveCategories(updated).catch((err) => {
        console.warn('[CategoryStore] Failed to persist after category deletion:', err);
      });

      return { canDelete: true, expenseCount: 0 };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete category on backend.';
      console.error('[CategoryStore] API deletion failed:', errorMessage);
      return {
        canDelete: false,
        expenseCount: 0,
        message: errorMessage,
      };
    }
  },

  resetToDefaults: async () => {
    await get().loadCategories();
  },

  getActiveCategories: () => {
    return get().categories.filter((cat) => cat.isActive && OBJECT_ID_REGEX.test(cat.id));
  },
}));
