import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  amount: z.number().positive('Amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  tags: z.array(z.string()).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
