import { create } from 'zustand';
import { incomeApi } from '@/services/api/incomeApi';
import {
  MonthlyIncome,
  CreateIncomePayload,
  UpdateIncomePayload,
} from '../types/income.types';

export interface IncomeState {
  selectedYear: number;
  selectedMonth: number;
  currentIncome: MonthlyIncome | null;
  incomes: MonthlyIncome[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  setSelectedMonth: (year: number, month: number) => Promise<void>;
  loadIncomeForMonth: (year: number, month: number) => Promise<MonthlyIncome | null>;
  loadAllIncomes: () => Promise<void>;
  saveIncome: (payload: CreateIncomePayload) => Promise<MonthlyIncome>;
  updateIncome: (id: string, payload: UpdateIncomePayload) => Promise<MonthlyIncome>;
  deleteIncome: (id: string) => Promise<void>;
}

const now = new Date();

export const useIncomeStore = create<IncomeState>((set, get) => ({
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  currentIncome: null,
  incomes: [],
  isLoading: false,
  isSaving: false,
  error: null,

  setSelectedMonth: async (year: number, month: number) => {
    set({ selectedYear: year, selectedMonth: month });
    await get().loadIncomeForMonth(year, month);
  },

  loadIncomeForMonth: async (year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const income = await incomeApi.getIncomeByMonth(year, month);
      set({ currentIncome: income, isLoading: false });
      return income;
    } catch (err: any) {
      const message = err?.message || 'Failed to load monthly income';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  loadAllIncomes: async () => {
    try {
      const incomes = await incomeApi.getIncomes();
      set({ incomes });
    } catch {
      // Non-blocking
    }
  },

  saveIncome: async (payload: CreateIncomePayload) => {
    set({ isSaving: true, error: null });
    try {
      const saved = await incomeApi.createOrUpdateIncome(payload);
      const { selectedYear, selectedMonth } = get();

      // If saved income is for the currently selected month, update currentIncome
      if (saved.year === selectedYear && saved.month === selectedMonth) {
        set({ currentIncome: saved });
      }

      // Update incomes list
      set((state) => {
        const index = state.incomes.findIndex(
          (i) => i.year === saved.year && i.month === saved.month
        );
        let updated: MonthlyIncome[];
        if (index >= 0) {
          updated = [...state.incomes];
          updated[index] = saved;
        } else {
          updated = [saved, ...state.incomes];
        }
        return { incomes: updated, isSaving: false };
      });

      return saved;
    } catch (err: any) {
      const message = err?.message || 'Failed to save income';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  updateIncome: async (id: string, payload: UpdateIncomePayload) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await incomeApi.updateIncome(id, payload);
      const { currentIncome } = get();
      if (currentIncome && currentIncome.id === id) {
        set({ currentIncome: updated });
      }
      set((state) => ({
        incomes: state.incomes.map((item) => (item.id === id ? updated : item)),
        isSaving: false,
      }));
      return updated;
    } catch (err: any) {
      const message = err?.message || 'Failed to update income';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  deleteIncome: async (id: string) => {
    set({ isSaving: true, error: null });
    try {
      await incomeApi.deleteIncome(id);
      const { currentIncome } = get();
      if (currentIncome && currentIncome.id === id) {
        set({ currentIncome: null });
      }
      set((state) => ({
        incomes: state.incomes.filter((item) => item.id !== id),
        isSaving: false,
      }));
    } catch (err: any) {
      const message = err?.message || 'Failed to delete income';
      set({ error: message, isSaving: false });
      throw err;
    }
  },
}));
