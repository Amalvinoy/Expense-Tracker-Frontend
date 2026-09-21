import { apiClient } from './apiClient';
import {
  CategoryBreakdownItem,
} from '@/features/reports/types/report.types';

/**
 * Report API Service
 * Handles analytics, monthly financial reports, and category breakdowns.
 */
export const reportApi = {
  /**
   * Fetch comprehensive monthly spending report
   */
  async getMonthlyReport(monthKey?: string): Promise<any> {
    const res = await apiClient.get<any>('/reports/monthly', {
      params: { month: monthKey },
    });
    return res?.data || res;
  },

  /**
   * Fetch category-level expenditure breakdown
   */
  async getCategoryBreakdown(monthKey?: string): Promise<CategoryBreakdownItem[]> {
    const res = await apiClient.get<any>('/reports/categories', {
      params: { month: monthKey },
    });
    return res?.data?.categories || res?.data || (Array.isArray(res) ? res : []);
  },
};
