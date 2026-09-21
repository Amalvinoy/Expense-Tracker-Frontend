import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Budget, CreateBudgetPayload } from '../types/budget.types';
import { Category } from '@/features/categories/types/category.types';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface BudgetFormModalProps {
  visible: boolean;
  budgetToEdit?: Budget | null;
  mode: 'total' | 'category';
  categories: Category[];
  currentTotalBudget?: number;
  targetMonth?: string;
  targetMonthFormatted?: string;
  onClose: () => void;
  onSaveTotalBudget: (amount: number, targetMonth?: string) => Promise<void>;
  onSaveCategoryBudget: (payload: CreateBudgetPayload) => Promise<void>;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  visible,
  budgetToEdit,
  mode: initialMode,
  categories,
  currentTotalBudget = 0,
  targetMonth,
  targetMonthFormatted,
  onClose,
  onSaveTotalBudget,
  onSaveCategoryBudget,
}) => {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<'total' | 'category'>(initialMode);
  const [amountInput, setAmountInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevBudgetToEdit, setPrevBudgetToEdit] = useState(budgetToEdit);

  if (visible !== prevVisible || budgetToEdit !== prevBudgetToEdit) {
    setPrevVisible(visible);
    setPrevBudgetToEdit(budgetToEdit);
    setMode(initialMode);
    if (budgetToEdit) {
      setAmountInput(budgetToEdit.amount.toString());
      const matchingCat = categories.find((c) => c.id === budgetToEdit.categoryId);
      setSelectedCategory(matchingCat || null);
    } else {
      setAmountInput(initialMode === 'total' && currentTotalBudget > 0 ? currentTotalBudget.toString() : '');
      setSelectedCategory(null);
    }
    setError(null);
  }

  const handleSave = async () => {
    const parsedAmount = parseFloat(amountInput);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid budget amount greater than ₹0.');
      return;
    }

    if (mode === 'category' && !selectedCategory) {
      setError('Please select a category for this budget limit.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'total') {
        await onSaveTotalBudget(parsedAmount, targetMonth);
      } else if (selectedCategory) {
        await onSaveCategoryBudget({
          type: 'category',
          amount: parsedAmount,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          categoryIcon: selectedCategory.icon,
          categoryColor: selectedCategory.color,
          categoryBg: selectedCategory.backgroundColor,
          month: targetMonth,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
        />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Sheet Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm" color={colors.textPrimary}>
                {budgetToEdit
                  ? mode === 'total'
                    ? 'Edit Monthly Budget'
                    : `Edit ${budgetToEdit.categoryName} Budget`
                  : mode === 'total'
                  ? 'Set Monthly Budget'
                  : 'Add Category Budget'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Set planned spending limits to track progress
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Target Month Indicator */}
            {targetMonthFormatted && (
              <View style={[styles.targetMonthBanner, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <AppIcon name="calendar-month" size={18} color={colors.primary} />
                <View style={{ marginLeft: spacing.xs, flex: 1 }}>
                  <AppText variant="caption" color={colors.textSecondary}>Target Period</AppText>
                  <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
                    {targetMonthFormatted}
                  </AppText>
                </View>
              </View>
            )}

            {/* Mode Selector (only when creating new budget) */}
            {!budgetToEdit && (
              <View style={[styles.modeSelector, { backgroundColor: colors.surfaceVariant }]}>
                <Pressable
                  onPress={() => setMode('total')}
                  style={[
                    styles.modeTab,
                    mode === 'total' && [styles.modeTabActive, { backgroundColor: colors.surface }],
                  ]}
                >
                  <AppIcon
                    name="cash-multiple"
                    size={16}
                    color={mode === 'total' ? colors.primary : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    variant="bodySmMedium"
                    color={mode === 'total' ? colors.primary : colors.textSecondary}
                    weight="600"
                  >
                    Total Monthly
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => setMode('category')}
                  style={[
                    styles.modeTab,
                    mode === 'category' && [styles.modeTabActive, { backgroundColor: colors.surface }],
                  ]}
                >
                  <AppIcon
                    name="shape-outline"
                    size={16}
                    color={mode === 'category' ? colors.primary : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    variant="bodySmMedium"
                    color={mode === 'category' ? colors.primary : colors.textSecondary}
                    weight="600"
                  >
                    Category Limit
                  </AppText>
                </Pressable>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.inputSection}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                {mode === 'total' ? 'Monthly Total Limit (₹)' : 'Category Spending Limit (₹)'}
              </AppText>
              <AppInput
                placeholder="e.g. 15000"
                value={amountInput}
                onChangeText={(text) => {
                  setAmountInput(text.replace(/[^0-9.]/g, ''));
                  setError(null);
                }}
                keyboardType="numeric"
                leftIcon={<AppText variant="bodyMdMedium" color={colors.textSecondary}>₹</AppText>}
                error={error || undefined}
              />
            </View>

            {/* Category Selector (only in category mode) */}
            {mode === 'category' && (
              <View style={styles.categorySection}>
                <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                  Select Category
                </AppText>
                <View style={styles.categoryGrid}>
                  {categories.filter((cat) => cat.isActive !== false).map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;

                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setError(null);
                        }}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isSelected ? colors.primarySoft : colors.surfaceVariant,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <CategoryIcon
                          category={cat.name}
                          iconName={cat.icon}
                          color={cat.color}
                          backgroundColor={cat.backgroundColor}
                          size="sm"
                        />
                        <AppText
                          variant="caption"
                          color={isSelected ? colors.primary : colors.textPrimary}
                          weight={isSelected ? '600' : '400'}
                          numberOfLines={1}
                          style={styles.catName}
                        >
                          {cat.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
            <AppButton
              title="Cancel"
              variant="outline"
              size="md"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              title={isSubmitting ? 'Saving...' : 'Save Budget'}
              variant="primary"
              size="md"
              loading={isSubmitting}
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '82%',
    ...shadows.floating,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: spacing.xxs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  targetMonthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  modeTabActive: {
    ...shadows.low,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  catName: {
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
