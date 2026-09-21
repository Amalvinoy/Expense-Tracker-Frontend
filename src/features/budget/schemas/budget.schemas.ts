import { z } from 'zod';

export const totalBudgetSchema = z.object({
  amount: z
    .number()
    .positive('Total budget must be greater than 0')
    .max(100000000, 'Budget exceeds allowable limit'),
});

export const categoryBudgetSchema = z.object({
  amount: z
    .number()
    .positive('Budget amount must be greater than 0')
    .max(100000000, 'Budget exceeds allowable limit'),
  categoryId: z.string().min(1, 'Please select a category'),
});

export type TotalBudgetSchemaType = z.infer<typeof totalBudgetSchema>;
export type CategoryBudgetSchemaType = z.infer<typeof categoryBudgetSchema>;
