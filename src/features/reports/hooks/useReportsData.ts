import { useState, useMemo, useEffect } from 'react';
import { useExpenseStore } from '@/store/expense.store';
import { useCategoryStore } from '@/features/categories/store/category.store';
import { ReportTimeRange, DateRange, ReportData } from '../types/report.types';
import { generateCompleteReportData } from '../utils/report.utils';
import { subDays } from 'date-fns';

export const useReportsData = () => {
  const { expenses, loadExpenses } = useExpenseStore();
  const { categories, loadCategories } = useCategoryStore();

  const [timeRange, setTimeRange] = useState<ReportTimeRange>('this_month');
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [loadExpenses, loadCategories]);

  const reportData: ReportData = useMemo(() => {
    return generateCompleteReportData(expenses, categories, timeRange, customRange);
  }, [expenses, categories, timeRange, customRange]);

  return {
    reportData,
    timeRange,
    setTimeRange,
    customRange,
    setCustomRange,
    totalExpensesLoaded: expenses.length,
  };
};
