import { apiClient } from './apiClient';
import {
  MonthlyIncome,
  CreateIncomePayload,
  UpdateIncomePayload,
} from '@/features/income/types/income.types';

export const incomeApi = {
  /**
   * Get income for a specific month and year
   */
  async getIncomeByMonth(year: number, month: number): Promise<MonthlyIncome | null> {
    const res = await apiClient.get<any>(`/income/month/${year}/${month}`);
    const data = res?.data || res;
    return data?.income || null;
  },

  /**
   * Get list of incomes with optional year/month filter
   */
  async getIncomes(params?: { year?: number; month?: number }): Promise<MonthlyIncome[]> {
    const res = await apiClient.get<any>('/income', { params });
    const data = res?.data || res;
    return Array.isArray(data?.incomes) ? data.incomes : [];
  },

  /**
   * Create or update monthly income (upsert)
   */
  async createOrUpdateIncome(payload: CreateIncomePayload): Promise<MonthlyIncome> {
    const res = await apiClient.post<any>('/income', payload);
    const data = res?.data || res;
    return data?.income || data;
  },

  /**
   * Update existing monthly income by ID
   */
  async updateIncome(id: string, payload: UpdateIncomePayload): Promise<MonthlyIncome> {
    const res = await apiClient.put<any>(`/income/${id}`, payload);
    const data = res?.data || res;
    return data?.income || data;
  },

  /**
   * Delete monthly income by ID
   */
  async deleteIncome(id: string): Promise<void> {
    await apiClient.delete(`/income/${id}`);
  },
};
