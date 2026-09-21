import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { parseISO, format, isValid } from 'date-fns';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useExpenseStore } from '@/store/expense.store';
import { formatExpenseAmount, formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';

export default function ExpenseDetailsScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { expenses, deleteExpense } = useExpenseStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [successBannerMessage, setSuccessBannerMessage] = useState<string | null>(null);

  const expense = expenses.find((item) => item.id === id);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/expense/history');
    }
  };

  const handleEdit = () => {
    if (!expense) return;
    router.push(`/expense/edit/${expense.id}` as any);
  };

  const confirmDeleteAction = async () => {
    if (!expense) return;
    setDeleteModalVisible(false);
    setIsDeleting(true);

    try {
      await deleteExpense(expense.id);
      setSuccessBannerMessage('Expense permanently removed.');

      // Return to history or previous screen after brief confirmation
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/expense/history');
        }
      }, 750);
    } catch (err) {
      console.error('[ExpenseDetails] Failed to delete expense:', err);
      setIsDeleting(false);
    }
  };

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      setDeleteModalVisible(true);
      return;
    }

    // Native alert with warning dialog
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This transaction will be permanently removed from your records and financial summary.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: confirmDeleteAction,
        },
      ],
      { cancelable: true }
    );
  };

  if (!expense) {
    return (
      <ScreenContainer
        header={
          <View style={styles.navBar}>
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
              Expense Details
            </AppText>
            <View style={{ width: 28 }} />
          </View>
        }
      >
        <EmptyState
          icon="receipt-text-remove-outline"
          title="Expense Not Found"
          description="The expense you are looking for may have been deleted or does not exist."
          actionTitle="Back to Expense History"
          onActionPress={() => router.replace('/expense/history')}
          style={{ marginTop: spacing.xxl }}
        />
      </ScreenContainer>
    );
  }

  // Formatted date values
  const dateObj = parseISO(expense.date);
  const formattedTransactionDate = isValid(dateObj)
    ? format(dateObj, 'MMMM d, yyyy · h:mm a')
    : expense.date;

  const createdObj = parseISO(expense.createdAt);
  const formattedCreatedAt = isValid(createdObj)
    ? format(createdObj, 'MMM d, yyyy · h:mm a')
    : expense.createdAt;

  const paymentIconMap: Record<string, string> = {
    UPI: 'cellphone-wireless',
    Cash: 'cash-multiple',
    'Credit Card': 'credit-card-outline',
    'Debit Card': 'credit-card',
    'Bank Transfer': 'bank-transfer',
    Other: 'wallet-outline',
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'bottom']}
      header={
        <View
          style={[
            styles.navBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.divider },
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
            Expense Details
          </AppText>

          <Pressable
            onPress={handleEdit}
            style={styles.editHeaderButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit this expense"
          >
            <AppIcon name="pencil-outline" size={22} color={colors.primary} />
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
          <View style={styles.actionButtonsRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppButton
                title="Edit"
                variant="outline"
                size="lg"
                onPress={handleEdit}
                leftIcon={<AppIcon name="pencil-outline" size={18} color={colors.primary} />}
                fullWidth
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppButton
                title="Delete"
                variant="danger"
                size="lg"
                loading={isDeleting}
                onPress={handleDeletePress}
                leftIcon={<AppIcon name="trash-can-outline" size={18} color={colors.surface} />}
                fullWidth
              />
            </View>
          </View>
        </View>
      }
    >
      {/* Success Notification Banner */}
      {successBannerMessage && (
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
            {successBannerMessage}
          </AppText>
        </View>
      )}

      {/* 1. Hero Summary Card */}
      <AppCard variant="elevated" style={styles.heroCard}>
        <View style={styles.categoryIconContainer}>
          <CategoryIcon
            category={expense.categoryName || 'Other'}
            size="lg"
          />
        </View>

        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <AppText variant="labelSm" color={colors.textSecondary} weight="600">
            {(expense.categoryName || 'OTHER').toUpperCase()}
          </AppText>
        </View>

        <AppText
          variant="headingXl"
          style={[styles.amountText, { color: colors.textPrimary }]}
          weight="700"
        >
          {formatExpenseAmount(expense.amount)}
        </AppText>

        <View style={[styles.datePill, { backgroundColor: colors.surfaceVariant }]}>
          <AppIcon name="calendar-outline" size={14} color={colors.textSecondary} />
          <AppText
            variant="caption"
            color={colors.textSecondary}
            weight="500"
            style={{ marginLeft: 4 }}
          >
            {formatExpenseDate(expense.date)}
          </AppText>
        </View>
      </AppCard>

      {/* 2. Structured Details Card */}
      <AppCard variant="outlined" style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        {/* Category Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={[styles.detailIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="shape-outline" size={18} color={colors.primary} />
            </View>
            <AppText variant="bodyMd" color={colors.textSecondary}>
              Category
            </AppText>
          </View>
          <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
            {expense.categoryName || 'Other'}
          </AppText>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

        {/* Payment Method Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={[styles.detailIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon
                name={paymentIconMap[expense.paymentMethod] || 'credit-card-outline'}
                size={18}
                color={colors.info}
              />
            </View>
            <AppText variant="bodyMd" color={colors.textSecondary}>
              Payment Method
            </AppText>
          </View>
          <View
            style={[
              styles.methodBadge,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
            ]}
          >
            <AppText variant="bodySmMedium" color={colors.textPrimary} weight="600">
              {expense.paymentMethod}
            </AppText>
          </View>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

        {/* Date Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={[styles.detailIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="calendar-clock-outline" size={18} color={colors.success} />
            </View>
            <AppText variant="bodyMd" color={colors.textSecondary}>
              Date & Time
            </AppText>
          </View>
          <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
            {formattedTransactionDate}
          </AppText>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

        {/* Note Row */}
        <View style={styles.detailNoteSection}>
          <View style={styles.detailLeft}>
            <View style={[styles.detailIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="text-box-outline" size={18} color={colors.primaryDark} />
            </View>
            <AppText variant="bodyMd" color={colors.textSecondary}>
              Note / Remarks
            </AppText>
          </View>
          <View
            style={[
              styles.noteContentBox,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <AppText
              variant="bodyMd"
              color={expense.note ? colors.textPrimary : colors.textMuted}
              style={expense.note ? undefined : styles.italicText}
            >
              {expense.note || 'No note added for this transaction.'}
            </AppText>
          </View>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />

        {/* Created Date Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={[styles.detailIconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="clock-outline" size={18} color={colors.textMuted} />
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              Created On
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSecondary} weight="500">
            {formattedCreatedAt}
          </AppText>
        </View>
      </AppCard>

      {/* 3. Delete Confirmation Modal (Used on Web & Custom Modal fallback) */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.warningIconCircle, { backgroundColor: colors.dangerSoft }]}>
              <AppIcon name="alert-outline" size={32} color={colors.danger} />
            </View>

            <AppText
              variant="headingSm"
              style={[styles.modalTitle, { color: colors.textPrimary }]}
            >
              Delete Expense?
            </AppText>

            <AppText variant="bodyMd" color={colors.textSecondary} style={styles.modalMessage}>
              Are you sure you want to delete this expense? This transaction will be permanently removed from your records and financial summary.
            </AppText>

            <View style={styles.modalButtonsRow}>
              <View style={{ flex: 1, marginRight: spacing.xs }}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setDeleteModalVisible(false)}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <AppButton
                  title="Permanently Delete"
                  variant="danger"
                  size="md"
                  loading={isDeleting}
                  onPress={confirmDeleteAction}
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
    fontWeight: '600',
  },
  editHeaderButton: {
    padding: spacing.xxs,
  },
  footerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  categoryIconContainer: {
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  amountText: {
    marginVertical: spacing.xs,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  detailsCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  methodBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  rowDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  detailNoteSection: {
    paddingVertical: spacing.sm,
  },
  noteContentBox: {
    marginTop: spacing.xs,
    marginLeft: 32 + spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  italicText: {
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  warningIconCircle: {
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
