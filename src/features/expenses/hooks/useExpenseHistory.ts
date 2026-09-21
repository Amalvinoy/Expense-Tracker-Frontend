import { useState, useMemo, useCallback } from 'react';
import {
  parseISO,
  isValid,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ExpensesByDateGroup } from '../types/expense.types';
import { DateFilterPreset } from '../components/ExpenseFilterBar';
import { ExpenseSortOption } from '../components/ExpenseSortModal';
import { groupExpensesByDate } from '../utils/expense.utils';
import { useExpenseStore } from '@/store/expense.store';

export interface UseExpenseHistoryReturn {
  // Data
  groupedExpenses: ExpensesByDateGroup[];
  totalCount: number;
  totalFilteredAmount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Filter & Search states
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  datePreset: DateFilterPreset;
  setDatePreset: (preset: DateFilterPreset) => void;
  selectedCategoryId?: string;
  setSelectedCategoryId: (catId?: string) => void;
  sortBy: ExpenseSortOption;
  setSortBy: (sort: ExpenseSortOption) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  setCustomDateRange: (start?: Date, end?: Date) => void;

  // Modal controls
  sortModalVisible: boolean;
  setSortModalVisible: (visible: boolean) => void;

  // Actions
  resetFilters: () => void;
  refresh: () => Promise<void>;
}

export const useExpenseHistory = (): UseExpenseHistoryReturn => {
  const { expenses, isLoading: isStoreLoading, error: storeError, loadExpenses } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<ExpenseSortOption>('newest');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Filtering & Sorting pipeline
  const filteredExpenses = useMemo(() => {
    let list = [...expenses];

    // Filter by Date Preset
    if (datePreset !== 'all') {
      list = list.filter((item) => {
        const date = parseISO(item.date);
        if (!isValid(date)) return false;

        switch (datePreset) {
          case 'today':
            return isToday(date);
          case 'yesterday':
            return isYesterday(date);
          case 'week':
            return isThisWeek(date, { weekStartsOn: 1 });
          case 'month':
            return isThisMonth(date);
          case 'custom':
            if (customStartDate && customEndDate) {
              const start = startOfDay(customStartDate).getTime();
              const end = endOfDay(customEndDate).getTime();
              const time = date.getTime();
              return time >= start && time <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Filter by Category
    if (selectedCategoryId) {
      list = list.filter((item) => item.categoryId === selectedCategoryId);
    }

    // Filter by Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const noteMatch = item.note?.toLowerCase().includes(q);
        const categoryMatch = item.categoryName.toLowerCase().includes(q);
        const methodMatch = item.paymentMethod.toLowerCase().includes(q);
        const amountMatch = item.amount.toString().includes(q);
        return noteMatch || categoryMatch || methodMatch || amountMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const dateA = parseISO(a.date).getTime();
      const dateB = parseISO(b.date).getTime();

      switch (sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    return list;
  }, [expenses, datePreset, selectedCategoryId, searchQuery, sortBy, customStartDate, customEndDate]);

  // 2. Group expenses by date
  const groupedExpenses = useMemo(() => {
    return groupExpensesByDate(filteredExpenses);
  }, [filteredExpenses]);

  // Summary metrics
  const totalCount = filteredExpenses.length;
  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setDatePreset('all');
    setSelectedCategoryId(undefined);
    setSortBy('newest');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadExpenses();
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadExpenses]);

  return {
    groupedExpenses,
    totalCount,
    totalFilteredAmount,
    isLoading: isStoreLoading,
    isRefreshing,
    error: storeError,
    searchQuery,
    setSearchQuery,
    datePreset,
    setDatePreset,
    selectedCategoryId,
    setSelectedCategoryId,
    sortBy,
    setSortBy,
    customStartDate,
    customEndDate,
    setCustomDateRange: (start, end) => {
      setCustomStartDate(start);
      setCustomEndDate(end);
      if (start && end) setDatePreset('custom');
    },
    sortModalVisible,
    setSortModalVisible,
    resetFilters,
    refresh,
  };
};
