import { PaymentMethod, ExpenseCategoryInfo } from '../types/expense.types';
import { colors } from '@/constants/colors';

export const DEFAULT_CURRENCY = 'INR' as const;
export const CURRENCY_SYMBOL = '₹' as const;
export const DEFAULT_LOCALE = 'en-IN' as const;

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: 'Cash', label: 'Cash', icon: 'cash' },
  { value: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: 'qrcode-scan' },
  { value: 'Credit Card', label: 'Credit Card', icon: 'credit-card-outline' },
  { value: 'Debit Card', label: 'Debit Card', icon: 'credit-card' },
  { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/IMPS)', icon: 'bank-outline' },
  { value: 'Other', label: 'Other', icon: 'dots-horizontal' },
];

export const DEFAULT_CATEGORIES: ExpenseCategoryInfo[] = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: 'silverware-fork-knife',
    color: colors.categories.food.color,
    backgroundColor: colors.categories.food.bg,
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: 'car-outline',
    color: colors.categories.transportation.color,
    backgroundColor: colors.categories.transportation.bg,
  },
  {
    id: 'cat_housing',
    name: 'Housing & Utilities',
    icon: 'home-outline',
    color: colors.categories.housing.color,
    backgroundColor: colors.categories.housing.bg,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: 'shopping-outline',
    color: colors.categories.shopping.color,
    backgroundColor: colors.categories.shopping.bg,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: 'movie-outline',
    color: colors.categories.entertainment.color,
    backgroundColor: colors.categories.entertainment.bg,
  },
  {
    id: 'cat_healthcare',
    name: 'Healthcare',
    icon: 'heart-pulse',
    color: colors.categories.healthcare.color,
    backgroundColor: colors.categories.healthcare.bg,
  },
  {
    id: 'cat_education',
    name: 'Education',
    icon: 'school-outline',
    color: colors.categories.education.color,
    backgroundColor: colors.categories.education.bg,
  },
  {
    id: 'cat_personal',
    name: 'Personal Care',
    icon: 'spa-outline',
    color: colors.categories.personalCare.color,
    backgroundColor: colors.categories.personalCare.bg,
  },
  {
    id: 'cat_travel',
    name: 'Travel',
    icon: 'airplane',
    color: colors.categories.travel.color,
    backgroundColor: colors.categories.travel.bg,
  },
  {
    id: 'cat_investments',
    name: 'Investments',
    icon: 'chart-line',
    color: colors.categories.investments.color,
    backgroundColor: colors.categories.investments.bg,
  },
  {
    id: 'cat_other',
    name: 'Other',
    icon: 'dots-horizontal-circle-outline',
    color: colors.categories.other.color,
    backgroundColor: colors.categories.other.bg,
  },
];
