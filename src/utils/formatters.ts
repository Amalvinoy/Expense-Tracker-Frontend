import { APP_CONFIG } from '../constants/config';

/**
 * Format a number into currency representation
 * e.g., 1250.5 -> "$1,250.50"
 */
export const formatCurrency = (
  amount: number,
  currency: string = APP_CONFIG.defaultCurrency,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
