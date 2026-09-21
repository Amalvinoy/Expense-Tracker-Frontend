import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { AppCard } from '@/components/common/AppCard';
import { AppInput } from '@/components/common/AppInput';
import { AmountHeroInput } from './AmountHeroInput';
import { CategorySelector } from './CategorySelector';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { DateSelector } from './DateSelector';
import {
  createExpenseSchema,
  CreateExpenseSchemaType,
} from '../schemas/expense.schemas';
import {
  CreateExpensePayload,
  ExpenseCategoryInfo,
  PaymentMethod,
} from '../types/expense.types';
import { useCategoryStore } from '@/features/categories/store/category.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export interface ExpenseFormProps {
  title?: string;
  submitButtonTitle?: string;
  isEditing?: boolean;
  initialData?: Partial<CreateExpensePayload>;
  onSubmitExpense: (data: CreateExpensePayload) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  title,
  submitButtonTitle,
  isEditing = false,
  initialData,
  onSubmitExpense,
  onCancel,
  onSuccess,
}) => {
  const { colors } = useAppTheme();
  const { categories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validCategories = categories.filter(
    (c) => c.isActive && OBJECT_ID_REGEX.test(c.id)
  );

  const defaultTitle = isEditing ? 'Edit Expense' : 'Add Expense';
  const defaultSubmitTitle = isEditing ? 'Update Expense' : 'Save Expense';
  const resolvedTitle = title || defaultTitle;
  const resolvedSubmitTitle = submitButtonTitle || defaultSubmitTitle;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [amountInput, setAmountInput] = useState(
    initialData?.amount && initialData.amount > 0 ? initialData.amount.toString() : ''
  );

  const form = useForm<CreateExpenseSchemaType>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: initialData?.amount ?? 0,
      categoryId:
        initialData?.categoryId && OBJECT_ID_REGEX.test(initialData.categoryId)
          ? initialData.categoryId
          : validCategories[0]?.id ?? '',
      categoryName:
        initialData?.categoryName || validCategories[0]?.name || '',
      categoryIcon:
        initialData?.categoryIcon || validCategories[0]?.icon || 'shape-outline',
      paymentMethod: initialData?.paymentMethod ?? 'UPI',
      date: initialData?.date ?? new Date().toISOString(),
      note: initialData?.note ?? '',
    },
    mode: 'onTouched',
  });

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  // Ensure category is populated once categories load from backend if currently empty or invalid
  useEffect(() => {
    const currentCategoryId = form.getValues('categoryId');
    if (
      (!currentCategoryId || !OBJECT_ID_REGEX.test(currentCategoryId)) &&
      validCategories.length > 0
    ) {
      const first = validCategories[0];
      setValue('categoryId', first.id, { shouldValidate: true });
      setValue('categoryName', first.name, { shouldValidate: true });
      setValue('categoryIcon', first.icon, { shouldValidate: true });
    }
  }, [validCategories, form, setValue]);

  const selectedCategoryId = useWatch({ control, name: 'categoryId' });
  const selectedPaymentMethod = useWatch({ control, name: 'paymentMethod' });
  const selectedDate = useWatch({ control, name: 'date' });
  const noteValue = useWatch({ control, name: 'note' }) || '';

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData?.amount !== undefined && initialData.amount > 0) {
      setAmountInput(initialData.amount.toString());
    }
  }

  // Synchronize react-hook-form state when initialData becomes available or changes
  useEffect(() => {
    if (initialData) {
      const validInitialCat =
        initialData.categoryId && OBJECT_ID_REGEX.test(initialData.categoryId);
      const fallback = validCategories[0];
      reset({
        amount: initialData.amount ?? 0,
        categoryId: validInitialCat
          ? (initialData.categoryId as string)
          : fallback?.id || '',
        categoryName: validInitialCat
          ? initialData.categoryName || fallback?.name || ''
          : fallback?.name || '',
        categoryIcon: validInitialCat
          ? initialData.categoryIcon || fallback?.icon || 'shape-outline'
          : fallback?.icon || 'shape-outline',
        paymentMethod: initialData.paymentMethod ?? 'UPI',
        date: initialData.date ?? new Date().toISOString(),
        note: initialData.note ?? '',
      });
    }
  }, [initialData, reset, validCategories]);

  const handleAmountChange = (text: string) => {
    setAmountInput(text);
    const num = parseFloat(text);
    setValue('amount', isNaN(num) ? 0 : num, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCategorySelect = (category: ExpenseCategoryInfo) => {
    setValue('categoryId', category.id, { shouldValidate: true, shouldDirty: true });
    setValue('categoryName', category.name, { shouldValidate: true, shouldDirty: true });
    setValue('categoryIcon', category.icon, { shouldValidate: true, shouldDirty: true });
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setValue('paymentMethod', method, { shouldValidate: true, shouldDirty: true });
  };

  const handleDateChange = (dateISO: string) => {
    setValue('date', dateISO, { shouldValidate: true, shouldDirty: true });
  };

  const onFormSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmitExpense({
        amount: data.amount,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryIcon: data.categoryIcon,
        paymentMethod: data.paymentMethod,
        note: data.note?.trim() || undefined,
        date: data.date,
      });

      setSuccessVisible(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('[ExpenseForm] Failed to submit expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'bottom']}
      header={
        <View
          style={[
            styles.headerBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.divider },
          ]}
        >
          <Pressable
            onPress={onCancel}
            style={styles.cancelButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <AppText variant="bodyMd" color={colors.textSecondary}>
              Cancel
            </AppText>
          </Pressable>

          <AppText variant="headingSm" style={styles.headerTitle}>
            {resolvedTitle}
          </AppText>

          <Pressable
            onPress={onFormSubmit}
            disabled={isSubmitting || successVisible}
            style={styles.saveHeaderButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={resolvedSubmitTitle}
          >
            <AppText
              variant="bodyMdMedium"
              color={isSubmitting || successVisible ? colors.textMuted : colors.primary}
              weight="600"
            >
              {isEditing ? 'Save' : 'Add'}
            </AppText>
          </Pressable>
        </View>
      }
      footer={
        <View
          style={[
            styles.footerContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.divider },
          ]}
        >
          <AppButton
            title={
              isSubmitting
                ? isEditing
                  ? 'Updating Expense...'
                  : 'Saving Expense...'
                : resolvedSubmitTitle
            }
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={successVisible}
            onPress={onFormSubmit}
            fullWidth
          />
        </View>
      }
    >
      {/* Success Notification Banner */}
      {successVisible && (
        <View
          style={[
            styles.successBanner,
            { backgroundColor: colors.successSoft, borderColor: colors.incomeLight },
          ]}
        >
          <AppIcon name="check-circle" size={20} color={colors.success} />
          <AppText
            variant="bodyMdMedium"
            color={colors.success}
            style={{ marginLeft: spacing.xs, flex: 1 }}
          >
            {isEditing
              ? 'Expense updated successfully! Returning...'
              : 'Expense logged successfully! Returning...'}
          </AppText>
        </View>
      )}

      {/* 1. Hero Amount Input */}
      <AmountHeroInput
        value={amountInput}
        onChangeText={handleAmountChange}
        error={errors.amount?.message}
      />

      <AppCard variant="elevated" style={styles.formCard}>
        {/* 2. Category Selection */}
        <CategorySelector
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
          error={errors.categoryId?.message}
        />

        {/* 3. Payment Method Selection */}
        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onSelectMethod={handlePaymentMethodSelect}
          error={errors.paymentMethod?.message}
        />

        {/* 4. Date Picker */}
        <DateSelector
          value={selectedDate}
          onChangeDate={handleDateChange}
          error={errors.date?.message}
        />

        {/* 5. Note Input */}
        <View style={styles.noteContainer}>
          <View style={styles.noteLabelRow}>
            <AppText variant="labelMd" color={colors.textPrimary}>
              Note (Optional)
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {noteValue.length} / 500
            </AppText>
          </View>

          <AppInput
            placeholder="Add details, tags, or description..."
            value={noteValue}
            onChangeText={(text) => setValue('note', text, { shouldValidate: true })}
            maxLength={500}
            multiline
            numberOfLines={3}
            inputStyle={styles.noteInput}
            error={errors.note?.message}
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: spacing.xxs,
  },
  headerTitle: {
    fontWeight: '600',
  },
  saveHeaderButton: {
    padding: spacing.xxs,
  },
  footerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  noteContainer: {
    marginTop: spacing.xs,
  },
  noteLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  noteInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
