import { format, parseISO, isValid, isToday, isYesterday, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Format an ISO date string or Date object into human-readable format
 * e.g., "Oct 24, 2024"
 */
export const formatDate = (date: string | Date, pattern: string = 'MMM dd, yyyy'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Invalid Date';
    return format(parsedDate, pattern);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get friendly relative date label: "Today", "Yesterday", or formatted date
 */
export const getRelativeDateLabel = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Invalid Date';
    if (isToday(parsedDate)) return 'Today';
    if (isYesterday(parsedDate)) return 'Yesterday';
    return format(parsedDate, 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get start and end ISO strings for the current month
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString(),
  };
};
