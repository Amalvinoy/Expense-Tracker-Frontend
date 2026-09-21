import React from 'react';
import { useRouter } from 'expo-router';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { CreateExpensePayload } from '@/features/expenses/types/expense.types';
import { useExpenseStore } from '@/store/expense.store';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { createExpense } = useExpenseStore();

  const handleSubmit = async (data: CreateExpensePayload) => {
    await createExpense(data);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, 800);
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <ExpenseForm
      title="Add Expense"
      submitButtonTitle="Save Expense"
      onSubmitExpense={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
