import { apiClient } from './apiClient';
import {
  Lending,
  CreateLendingPayload,
  UpdateLendingPayload,
  RecordRepaymentPayload,
  LendingSummary,
} from '@/features/lending/types/lending.types';

export interface LendingListResponse {
  lendings: Lending[];
  summary: LendingSummary;
}

export const lendingApi = {
  /**
   * Fetch all lending records with summary
   */
  async getLendings(params?: { status?: string; search?: string }): Promise<LendingListResponse> {
    const res = await apiClient.get<any>('/lendings', { params });
    const data = res?.data || res;

    return {
      lendings: Array.isArray(data?.lendings) ? data.lendings : [],
      summary: data?.summary || {
        totalLent: 0,
        totalReturned: 0,
        totalOutstanding: 0,
        pendingCount: 0,
        partiallyPaidCount: 0,
        fullyPaidCount: 0,
      },
    };
  },

  /**
   * Fetch single lending record by ID
   */
  async getLendingById(id: string): Promise<Lending> {
    const res = await apiClient.get<any>(`/lendings/${id}`);
    const data = res?.data || res;
    return data?.lending || data;
  },

  /**
   * Create a new lending record
   */
  async createLending(payload: CreateLendingPayload): Promise<Lending> {
    const res = await apiClient.post<any>('/lendings', payload);
    const data = res?.data || res;
    return data?.lending || data;
  },

  /**
   * Update lending record by ID
   */
  async updateLending(id: string, payload: UpdateLendingPayload): Promise<Lending> {
    const res = await apiClient.put<any>(`/lendings/${id}`, payload);
    const data = res?.data || res;
    return data?.lending || data;
  },

  /**
   * Delete lending record by ID
   */
  async deleteLending(id: string): Promise<void> {
    await apiClient.delete(`/lendings/${id}`);
  },

  /**
   * Record a partial or full repayment
   */
  async recordRepayment(id: string, payload: RecordRepaymentPayload): Promise<Lending> {
    const res = await apiClient.post<any>(`/lendings/${id}/repayment`, payload);
    const data = res?.data || res;
    return data?.lending || data;
  },

  /**
   * Fetch lending summary metrics
   */
  async getSummary(): Promise<LendingSummary> {
    const res = await apiClient.get<any>('/lendings/summary');
    const data = res?.data || res;
    return (
      data?.summary || {
        totalLent: 0,
        totalReturned: 0,
        totalOutstanding: 0,
        pendingCount: 0,
        partiallyPaidCount: 0,
        fullyPaidCount: 0,
      }
    );
  },
};
