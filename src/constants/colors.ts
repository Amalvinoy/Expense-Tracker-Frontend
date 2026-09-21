/**
 * Expense Tracker Color Palette
 * Designed for modern personal finance applications.
 * Clean, subtle, high contrast, and accessible across both Light and Dark themes.
 */

export interface CategoryColorItem {
  color: string;
  bg: string;
}

export interface ThemeColors {
  // Brand / Core Primary
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;

  // Financial Semantics
  income: string;
  incomeDark: string;
  incomeLight: string;
  incomeSoft: string;

  expense: string;
  expenseDark: string;
  expenseLight: string;
  expenseSoft: string;

  transfer: string;
  transferSoft: string;

  investment: string;
  investmentSoft: string;

  // Status Colors
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  // Neutrals / Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceSubtle: string;
  card: string;
  border: string;
  borderFocus: string;
  divider: string;

  // Form Elements & Overlays
  inputBackground: string;
  inputBorder: string;
  modalOverlay: string;

  // Charts
  chartGrid: string;
  chartAxis: string;
  chartTooltip: string;

  // Typography Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Category Accent Colors & Backgrounds
  categories: Record<string, CategoryColorItem>;

  // Embedded dark reference for backwards compatibility
  dark?: Partial<ThemeColors>;
}

export const lightColors: ThemeColors = {
  // Brand
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  primarySoft: '#EFF6FF',

  // Financial Semantics
  income: '#10B981',
  incomeDark: '#059669',
  incomeLight: '#A7F3D0',
  incomeSoft: '#ECFDF5',

  expense: '#F43F5E',
  expenseDark: '#E11D48',
  expenseLight: '#FECDD3',
  expenseSoft: '#FFF1F2',

  transfer: '#3B82F6',
  transferSoft: '#EFF6FF',

  investment: '#8B5CF6',
  investmentSoft: '#F5F3FF',

  // Status Colors
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#0EA5E9',
  infoSoft: '#F0F9FF',

  // Neutrals (Light Mode)
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF', // Pure White Card Surface
  surfaceVariant: '#F1F5F9', // Slate 100
  surfaceSubtle: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0', // Slate 200 - clean, crisp borders
  borderFocus: '#2563EB',
  divider: '#F1F5F9',

  // Form & Modals
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  modalOverlay: 'rgba(15, 23, 42, 0.45)',

  // Charts
  chartGrid: '#E2E8F0',
  chartAxis: '#94A3B8',
  chartTooltip: '#0F172A',

  // Typography (Light Mode)
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Categories
  categories: {
    food: { color: '#EA580C', bg: '#FFF7ED' },
    transportation: { color: '#0284C7', bg: '#F0F9FF' },
    housing: { color: '#4F46E5', bg: '#EEF2FF' },
    shopping: { color: '#D946EF', bg: '#FDF4FF' },
    entertainment: { color: '#EC4899', bg: '#FDF2F8' },
    healthcare: { color: '#EF4444', bg: '#FEF2F2' },
    education: { color: '#0D9488', bg: '#F0FDFA' },
    personalCare: { color: '#8B5CF6', bg: '#F5F3FF' },
    travel: { color: '#059669', bg: '#ECFDF5' },
    investments: { color: '#6366F1', bg: '#EEF2FF' },
    salary: { color: '#10B981', bg: '#ECFDF5' },
    other: { color: '#64748B', bg: '#F8FAFC' },
  },
};

export const darkColors: ThemeColors = {
  // Brand
  primary: '#3B82F6', // Slightly lighter blue for dark contrast
  primaryDark: '#2563EB',
  primaryLight: '#93C5FD',
  primarySoft: 'rgba(59, 130, 246, 0.16)',

  // Financial Semantics
  income: '#34D399', // Emerald 400 for vibrant contrast
  incomeDark: '#10B981',
  incomeLight: '#6EE7B7',
  incomeSoft: 'rgba(52, 211, 153, 0.16)',

  expense: '#FB7185', // Rose 400 for clear legibility on dark
  expenseDark: '#F43F5E',
  expenseLight: '#FDA4AF',
  expenseSoft: 'rgba(251, 113, 133, 0.16)',

  transfer: '#60A5FA',
  transferSoft: 'rgba(96, 165, 250, 0.16)',

  investment: '#A78BFA',
  investmentSoft: 'rgba(167, 139, 250, 0.16)',

  // Status Colors
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  info: '#38BDF8',
  infoSoft: 'rgba(56, 189, 248, 0.16)',

  // Neutrals (Dark Mode - Slate Navy)
  background: '#0B0F19', // Deep dark backdrop
  surface: '#131B2E', // Elevated slate card surface
  surfaceVariant: '#1E293B', // Slate 800
  surfaceSubtle: '#162035', // Card interior / accent
  card: '#131B2E',
  border: '#243049', // Crisp slate border
  borderFocus: '#60A5FA',
  divider: '#1E293B',

  // Form & Modals
  inputBackground: '#162035',
  inputBorder: '#2A3754',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',

  // Charts
  chartGrid: '#243049',
  chartAxis: '#64748B',
  chartTooltip: '#1E293B',

  // Typography (Dark Mode)
  textPrimary: '#F8FAFC', // Slate 50 - high contrast
  textSecondary: '#94A3B8', // Slate 400 - description & meta
  textMuted: '#64748B', // Slate 500 - placeholders
  textInverse: '#0B0F19',

  // Categories (Adapted for dark contrast with soft transparent badge backdrops)
  categories: {
    food: { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.16)' },
    transportation: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.16)' },
    housing: { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.16)' },
    shopping: { color: '#E879F9', bg: 'rgba(232, 121, 249, 0.16)' },
    entertainment: { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.16)' },
    healthcare: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.16)' },
    education: { color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.16)' },
    personalCare: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.16)' },
    travel: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.16)' },
    investments: { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.16)' },
    salary: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.16)' },
    other: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.16)' },
  },
};

// Backwards-compatible default colors export
export const colors: ThemeColors = {
  ...lightColors,
  dark: darkColors,
};

export type Colors = ThemeColors;
