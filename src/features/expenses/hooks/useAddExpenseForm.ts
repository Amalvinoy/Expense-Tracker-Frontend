import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createExpenseSchema,
  CreateExpenseSchemaType,
} from '../schemas/expense.schemas';
import { ExpenseCategoryInfo, PaymentMethod } from '../types/expense.types';
import { useExpenseStore } from '@/store/expense.store';
import { useCategoryStore } from '@/features/categories/store/category.store';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const useAddExpenseForm = (onSuccess?: () => void) => {
  const { createExpense, isLoading: isStoreLoading } = useExpenseStore();
  const { categories, loadCategories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validCategories = categories.filter(
    (c) => c.isActive && OBJECT_ID_REGEX.test(c.id)
  );

  const form = useForm<CreateExpenseSchemaType>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      categoryId: validCategories[0]?.id ?? '',
      categoryName: validCategories[0]?.name ?? '',
      categoryIcon: validCategories[0]?.icon ?? 'shape-outline',
      paymentMethod: 'UPI',
      date: new Date().toISOString(),
      note: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    const currentCategoryId = form.getValues('categoryId');
    if (
      (!currentCategoryId || !OBJECT_ID_REGEX.test(currentCategoryId)) &&
      validCategories.length > 0
    ) {
      const first = validCategories[0];
      form.setValue('categoryId', first.id, { shouldValidate: true });
      form.setValue('categoryName', first.name, { shouldValidate: true });
      form.setValue('categoryIcon', first.icon, { shouldValidate: true });
    }
  }, [validCategories, form]);

  const handleAmountChange = (text: string) => {
    setAmountInput(text);
    const num = parseFloat(text);
    form.setValue('amount', isNaN(num) ? 0 : num, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCategorySelect = (category: ExpenseCategoryInfo) => {
    form.setValue('categoryId', category.id, { shouldValidate: true });
    form.setValue('categoryName', category.name, { shouldValidate: true });
    form.setValue('categoryIcon', category.icon, { shouldValidate: true });
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    form.setValue('paymentMethod', method, { shouldValidate: true });
  };

  const handleDateChange = (dateISO: string) => {
    form.setValue('date', dateISO, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await createExpense({
        amount: data.amount,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryIcon: data.categoryIcon,
        paymentMethod: data.paymentMethod,
        note: data.note,
        date: data.date,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[AddExpense] Failed to save expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    amountInput,
    handleAmountChange,
    handleCategorySelect,
    handlePaymentMethodSelect,
    handleDateChange,
    onSubmit,
    isSubmitting: isSubmitting || isStoreLoading,
  };
};
