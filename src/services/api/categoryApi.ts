import { apiClient } from './apiClient';
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/features/categories/types/category.types';

/**
 * Category API Service
 * Handles category retrieval, creation, updates, and deletion via backend endpoints.
 */
export const categoryApi = {
  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<any>('/categories');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data?.categories)) return res.data.categories;
    if (Array.isArray(res?.categories)) return res.categories;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  /**
   * Create a new category
   */
  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const res = await apiClient.post<any>('/categories', payload);
    return res?.data?.category || res?.category || res?.data || res;
  },

  /**
   * Update category by ID
   */
  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const res = await apiClient.put<any>(`/categories/${id}`, payload);
    return res?.data?.category || res?.category || res?.data || res;
  },

  /**
   * Delete category by ID
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
