import { create } from 'zustand';
import { lendingApi } from '@/services/api/lendingApi';
import {
  Lending,
  LendingStatus,
  LendingSummary,
  CreateLendingPayload,
  UpdateLendingPayload,
  RecordRepaymentPayload,
} from '../types/lending.types';

export interface LendingState {
  lendings: Lending[];
  summary: LendingSummary;
  isLoading: boolean;
  error: string | null;
  statusFilter: LendingStatus | 'ALL';
  searchQuery: string;

  loadLendings: () => Promise<void>;
  createLending: (payload: CreateLendingPayload) => Promise<Lending>;
  updateLending: (id: string, payload: UpdateLendingPayload) => Promise<Lending>;
  deleteLending: (id: string) => Promise<void>;
  recordRepayment: (id: string, payload: RecordRepaymentPayload) => Promise<Lending>;
  setStatusFilter: (filter: LendingStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
}

const defaultSummary: LendingSummary = {
  totalLent: 0,
  totalReturned: 0,
  totalOutstanding: 0,
  pendingCount: 0,
  partiallyPaidCount: 0,
  fullyPaidCount: 0,
};

export const useLendingStore = create<LendingState>((set, get) => ({
  lendings: [],
  summary: defaultSummary,
  isLoading: false,
  error: null,
  statusFilter: 'ALL',
  searchQuery: '',

  loadLendings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { statusFilter, searchQuery } = get();
      const params: { status?: string; search?: string } = {};

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await lendingApi.getLendings(params);
      set({
        lendings: res.lendings,
        summary: res.summary,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[LendingStore] Failed to load lendings:', err);
      set({
        isLoading: false,
        error: err?.message || 'Failed to load lending records.',
      });
    }
  },

  createLending: async (payload: CreateLendingPayload): Promise<Lending> => {
    set({ isLoading: true, error: null });
    try {
      const created = await lendingApi.createLending(payload);
      // Reload to get properly computed summary and sorted list
      await get().loadLendings();
      return created;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to create lending record.' });
      throw err;
    }
  },

  updateLending: async (id: string, payload: UpdateLendingPayload): Promise<Lending> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await lendingApi.updateLending(id, payload);
      await get().loadLendings();
      return updated;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to update lending record.' });
      throw err;
    }
  },

  deleteLending: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await lendingApi.deleteLending(id);
      await get().loadLendings();
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to delete lending record.' });
      throw err;
    }
  },

  recordRepayment: async (id: string, payload: RecordRepaymentPayload): Promise<Lending> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await lendingApi.recordRepayment(id, payload);
      await get().loadLendings();
      return updated;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to record repayment.' });
      throw err;
    }
  },

  setStatusFilter: (filter: LendingStatus | 'ALL') => {
    set({ statusFilter: filter });
    get().loadLendings();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().loadLendings();
  },
}));
