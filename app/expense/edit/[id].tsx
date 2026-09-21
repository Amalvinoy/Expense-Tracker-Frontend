import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { CreateExpensePayload } from '@/features/expenses/types/expense.types';
import { useExpenseStore } from '@/store/expense.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { expenses, updateExpense } = useExpenseStore();

  const expense = expenses.find((item) => item.id === id);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/expense/history');
    }
  };

  if (!expense) {
    return (
      <ScreenContainer
        header={
          <View
            style={[
              styles.navBar,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <Pressable
              onPress={handleBack}
              style={styles.navButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
            </Pressable>
            <AppText variant="headingSm" style={styles.navTitle}>
              Edit Expense
            </AppText>
            <View style={{ width: 28 }} />
          </View>
        }
      >
        <EmptyState
          icon="receipt-text-remove-outline"
          title="Expense Not Found"
          description="The expense you are trying to edit does not exist or has been removed."
          actionTitle="Back to Expense History"
          onActionPress={() => router.replace('/expense/history')}
          style={{ marginTop: spacing.xxl }}
        />
      </ScreenContainer>
    );
  }

  const handleSubmit = async (data: CreateExpensePayload) => {
    await updateExpense(expense.id, data);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(`/expense/${expense.id}` as any);
      }
    }, 800);
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/expense/${expense.id}` as any);
    }
  };

  return (
    <ExpenseForm
      title="Edit Expense"
      submitButtonTitle="Update Expense"
      isEditing
      initialData={{
        amount: expense.amount,
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        categoryIcon: expense.categoryIcon,
        paymentMethod: expense.paymentMethod,
        date: expense.date,
        note: expense.note || '',
      }}
      onSubmitExpense={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: spacing.xxs,
  },
  navTitle: {
    fontWeight: '600',
  },
});
