import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths } from 'date-fns';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { EmptyState } from '@/components/feedback/EmptyState';
import {
  Budget,
  CreateBudgetPayload,
  useBudgetStore,
  MonthlyBudgetOverviewCard,
  CategoryBudgetCard,
  BudgetFormModal,
  calculateTotalSpendingForMonth,
  calculateCategorySpendingForMonth,
  BUDGET_TIER_CONFIGS,
} from '@/features/budget';
import { useExpenseStore } from '@/store/expense.store';
import { useCategoryStore } from '@/features/categories/store/category.store';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export default function BudgetScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const {
    selectedMonth,
    setSelectedMonth,
    monthlyTotalBudget,
    categoryBudgets,
    loadBudgets,
    setMonthlyTotalBudget,
    addCategoryBudget,
    deleteCategoryBudget,
    deleteMonthlyTotalBudget,
  } = useBudgetStore();

  const { expenses, loadExpenses } = useExpenseStore();
  const { categories, loadCategories } = useCategoryStore();

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'total' | 'category'>('category');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    budget: Budget | null;
  }>({
    visible: false,
    budget: null,
  });

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadBudgets();
    loadExpenses();
    loadCategories();
  }, [loadBudgets, loadExpenses, loadCategories]);

  // Derive selected date from selectedMonth (YYYY-MM)
  const selectedDate = useMemo(() => {
    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      const [y, m] = selectedMonth.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  }, [selectedMonth]);

  const formattedMonth = useMemo(() => {
    return format(selectedDate, 'MMMM yyyy');
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const prev = subMonths(selectedDate, 1);
    setSelectedMonth(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const next = addMonths(selectedDate, 1);
    setSelectedMonth(format(next, 'yyyy-MM'));
  };

  // Compute spending amounts scoped to the selected month
  const totalSpentThisMonth = useMemo(() => {
    return calculateTotalSpendingForMonth(expenses, selectedDate);
  }, [expenses, selectedDate]);

  const categorySpendingMap = useMemo(() => {
    const map: Record<string, number> = {};
    categoryBudgets.forEach((b) => {
      map[b.id] = calculateCategorySpendingForMonth(
        expenses,
        b.categoryId,
        b.categoryName,
        selectedDate
      );
    });
    return map;
  }, [expenses, categoryBudgets, selectedDate]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleOpenAddBudget = () => {
    setEditingBudget(null);
    setFormMode('category');
    setFormModalVisible(true);
  };

  const handleEditTotalBudget = () => {
    setEditingBudget(null);
    setFormMode('total');
    setFormModalVisible(true);
  };

  const handleDeleteTotalBudget = () => {
    setDeleteConfirmModal({
      visible: true,
      budget: {
        id: 'total_budget',
        type: 'total',
        amount: monthlyTotalBudget,
        categoryName: `Total Budget (${formattedMonth})`,
        month: selectedMonth,
        createdAt: '',
        updatedAt: '',
      },
    });
  };

  const handleEditCategoryBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormMode('category');
    setFormModalVisible(true);
  };

  const handleDeleteCategoryBudget = (budget: Budget) => {
    setDeleteConfirmModal({
      visible: true,
      budget,
    });
  };

  const performDeleteBudget = async (budget: Budget) => {
    if (budget.id === 'total_budget') {
      await deleteMonthlyTotalBudget(selectedMonth);
      showNotificationBanner(`Monthly budget for ${formattedMonth} reset.`);
    } else {
      await deleteCategoryBudget(budget.id);
      showNotificationBanner(`Budget for "${budget.categoryName}" removed.`);
    }
    setDeleteConfirmModal({ visible: false, budget: null });
  };

  const showNotificationBanner = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 3200);
  };

  const handleSaveTotalBudget = async (amount: number, targetMonth?: string) => {
    const monthToUse = targetMonth || selectedMonth;
    await setMonthlyTotalBudget(amount, monthToUse);
    showNotificationBanner(`Monthly budget for ${formattedMonth} updated to ₹${amount.toLocaleString('en-IN')}.`);
  };

  const handleSaveCategoryBudget = async (payload: CreateBudgetPayload) => {
    await addCategoryBudget({
      ...payload,
      month: payload.month || selectedMonth,
    });
    showNotificationBanner(`Category budget for "${payload.categoryName}" (${formattedMonth}) saved.`);
  };

  return (
    <ScreenContainer
      scrollable={false}
      withPadding={false}
      header={
        <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>

          <AppText variant="headingSm" color={colors.textPrimary} style={styles.navTitle}>
            Budget & Limits
          </AppText>

          <Pressable
            onPress={handleOpenAddBudget}
            style={[styles.addBtn, { backgroundColor: colors.primarySoft }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add budget"
          >
            <AppIcon name="plus" size={22} color={colors.primary} />
          </Pressable>
        </View>
      }
    >
      {/* Month Navigation Selector */}
      <View style={[styles.monthNavContainer, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Pressable
          onPress={handlePrevMonth}
          style={[styles.monthArrowBtn, { backgroundColor: colors.surfaceVariant }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <AppIcon name="chevron-left" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.monthCenterInfo}>
          <AppText variant="headingSm" color={colors.textPrimary} style={{ fontWeight: '700' }}>
            {formattedMonth}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {monthlyTotalBudget > 0
              ? `Budget: ₹${monthlyTotalBudget.toLocaleString('en-IN')}`
              : 'No total budget set'}
          </AppText>
        </View>

        <Pressable
          onPress={handleNextMonth}
          style={[styles.monthArrowBtn, { backgroundColor: colors.surfaceVariant }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <AppIcon name="chevron-right" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Success Notification Banner */}
      {successBanner && (
        <View style={[styles.successBanner, { backgroundColor: colors.successSoft, borderColor: colors.incomeLight }]}>
          <AppIcon name="check-circle" size={20} color={colors.success} />
          <AppText
            variant="bodyMdMedium"
            color={colors.success}
            style={{ marginLeft: spacing.xs, flex: 1 }}
          >
            {successBanner}
          </AppText>
        </View>
      )}

      {/* Main Budget Content */}
      <FlatList
        data={categoryBudgets}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* 1. Monthly Total Budget Overview Hero */}
            <MonthlyBudgetOverviewCard
              totalBudget={monthlyTotalBudget}
              totalSpent={totalSpentThisMonth}
              onEditTotalBudget={handleEditTotalBudget}
              onDeleteTotalBudget={monthlyTotalBudget > 0 ? handleDeleteTotalBudget : undefined}
            />

            {/* 2. Budget Warning Tiers Guide */}
            <View style={[styles.legendContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ marginBottom: spacing.xs }}>
                BUDGET HEALTH THRESHOLDS
              </AppText>
              <View style={styles.legendPillsRow}>
                {(['safe', 'moderate', 'caution', 'exceeded'] as const).map((tierKey) => {
                  const cfg = BUDGET_TIER_CONFIGS[tierKey];
                  const pillBg = isDark ? cfg.color + '26' : cfg.backgroundColor;
                  return (
                    <View
                      key={tierKey}
                      style={[
                        styles.legendPill,
                        { backgroundColor: pillBg },
                      ]}
                    >
                      <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                      <AppText variant="caption" color={cfg.color} weight="600">
                        {cfg.label}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 3. Category Budgets Header */}
            <View style={styles.sectionHeader}>
              <AppText variant="headingSm" color={colors.textPrimary}>
                Category Limits ({categoryBudgets.length})
              </AppText>
              <Pressable
                onPress={handleOpenAddBudget}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Add category budget limit"
              >
                <AppText variant="labelMd" color={colors.primary} weight="600">
                  + Add Limit
                </AppText>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CategoryBudgetCard
            budget={item}
            spentAmount={categorySpendingMap[item.id] || 0}
            onEdit={handleEditCategoryBudget}
            onDelete={handleDeleteCategoryBudget}
            currency="INR"
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title={`No Category Budgets for ${formattedMonth}`}
            description="Set targeted limits for food, transport, shopping, and more to keep your monthly spending organized."
            actionTitle={`+ Set Budget for ${formattedMonth}`}
            onActionPress={handleOpenAddBudget}
            style={{ marginTop: spacing.md }}
          />
        }
      />

      {/* Add / Edit Budget Modal */}
      <BudgetFormModal
        visible={formModalVisible}
        budgetToEdit={editingBudget}
        mode={formMode}
        categories={categories}
        currentTotalBudget={monthlyTotalBudget}
        targetMonth={selectedMonth}
        targetMonthFormatted={formattedMonth}
        onClose={() => setFormModalVisible(false)}
        onSaveTotalBudget={handleSaveTotalBudget}
        onSaveCategoryBudget={handleSaveCategoryBudget}
      />

      {/* Delete Confirmation Dialog Modal */}
      <Modal
        visible={deleteConfirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModal({ visible: false, budget: null })}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.dangerIconCircle, { backgroundColor: colors.dangerSoft }]}>
              <AppIcon name="alert-outline" size={28} color={colors.danger} />
            </View>

            <AppText variant="headingSm" color={colors.textPrimary} style={styles.modalTitle}>
              Remove Budget Limit?
            </AppText>

            <AppText variant="bodyMd" color={colors.textSecondary} style={styles.modalMessage}>
              Are you sure you want to remove the budget limit for{' '}
              <AppText variant="bodyMdMedium" weight="600" color={colors.textPrimary}>
                &ldquo;{deleteConfirmModal.budget?.categoryName}&rdquo;
              </AppText>
              ? You can re-add it at any time.
            </AppText>

            <View style={styles.modalButtonsRow}>
              <View style={{ flex: 1, marginRight: spacing.xs }}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setDeleteConfirmModal({ visible: false, budget: null })}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <AppButton
                  title="Delete"
                  variant="danger"
                  size="md"
                  onPress={() => {
                    if (deleteConfirmModal.budget) {
                      performDeleteBudget(deleteConfirmModal.budget);
                    }
                  }}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
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
    fontWeight: '700',
  },
  addBtn: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  monthNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  monthArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenterInfo: {
    alignItems: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  headerContainer: {
    paddingTop: spacing.md,
  },
  legendContainer: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  legendPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    marginRight: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.high,
  },
  dangerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
