import { z } from 'zod';
import { PaymentMethod } from '../types/expense.types';

export const paymentMethodSchema = z.enum([
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Other',
] as const satisfies readonly [PaymentMethod, ...PaymentMethod[]]);

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Schema for Creating an Expense
 */
export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(10000000, 'Amount cannot exceed ₹1,00,00,000'),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .regex(OBJECT_ID_REGEX, 'Invalid category ID format. Must be a 24-character hexadecimal ObjectId'),
  categoryName: z.string().min(1, 'Category name is required'),
  categoryIcon: z.string().min(1, 'Category icon is required'),
  paymentMethod: paymentMethodSchema,
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  date: z.string().min(1, 'Expense date is required'),
});

export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>;

/**
 * Schema for Editing an Expense
 */
export const updateExpenseSchema = z.object({
  id: z.string().min(1, 'Expense ID is required'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(10000000, 'Amount cannot exceed ₹1,00,00,000')
    .optional(),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .regex(OBJECT_ID_REGEX, 'Invalid category ID format. Must be a 24-character hexadecimal ObjectId')
    .optional(),
  categoryName: z.string().min(1, 'Category name is required').optional(),
  categoryIcon: z.string().min(1, 'Category icon is required').optional(),
  paymentMethod: paymentMethodSchema.optional(),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  date: z.string().min(1, 'Expense date is required').optional(),
});

export type UpdateExpenseSchemaType = z.infer<typeof updateExpenseSchema>;
