import { storageService } from '../storage.service';
import { STORAGE_KEYS } from '../storage.keys';
import { Category } from '@/features/categories/types/category.types';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Local Category Storage Repository.
 * Encapsulates persistence logic for user categories with strict ObjectId validation.
 * Prunes any stale or legacy static IDs (e.g. cat_food, cat_entertainment).
 */
export const categoryStorage = {
  /**
   * Load categories from local storage.
   * Strips out any stale entries with non-MongoDB IDs.
   */
  async getCategories(): Promise<Category[]> {
    try {
      const stored = await storageService.getItem<Category[]>(STORAGE_KEYS.CATEGORIES);

      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Prune any legacy or static categories (such as cat_food, cat_entertainment)
        const valid = stored.filter(
          (c) => c && typeof c.id === 'string' && OBJECT_ID_REGEX.test(c.id)
        );

        if (valid.length !== stored.length) {
          // Stale cache detected with non-ObjectId entries -> update storage with only valid categories
          await storageService.setItem(STORAGE_KEYS.CATEGORIES, valid);
        }

        return valid;
      }

      return [];
    } catch (error) {
      console.warn('[CategoryStorage] Failed to read categories from storage:', error);
      return [];
    }
  },

  /**
   * Save categories to local storage (only valid MongoDB ObjectId items).
   */
  async saveCategories(categories: Category[]): Promise<boolean> {
    try {
      const valid = (categories || []).filter(
        (c) => c && typeof c.id === 'string' && OBJECT_ID_REGEX.test(c.id)
      );
      return await storageService.setItem(STORAGE_KEYS.CATEGORIES, valid);
    } catch (error) {
      console.error('[CategoryStorage] Failed to persist categories:', error);
      return false;
    }
  },

  /**
   * Clear stored categories cache.
   */
  async clearCategories(): Promise<boolean> {
    return storageService.removeItem(STORAGE_KEYS.CATEGORIES);
  },
};
