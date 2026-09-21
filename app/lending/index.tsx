import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { AppInput } from '@/components/common/AppInput';
import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useLendingStore } from '@/features/lending/store/lending.store';
import {
  Lending,
  LendingStatus,
} from '@/features/lending/types/lending.types';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export default function LendingScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { settings } = useSettingsStore();

  const {
    lendings,
    summary,
    isLoading,
    loadLendings,
    createLending,
    updateLending,
    deleteLending,
    recordRepayment,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useLendingStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Add / Edit Modal state
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingLending, setEditingLending] = useState<Lending | null>(null);
  const [formPersonName, setFormPersonName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Repayment Modal state
  const [repaymentModalVisible, setRepaymentModalVisible] = useState(false);
  const [repaymentTarget, setRepaymentTarget] = useState<Lending | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentNote, setRepaymentNote] = useState('');
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lending | null>(null);

  useEffect(() => {
    loadLendings();
  }, [loadLendings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLendings();
    setIsRefreshing(false);
  };

  const showBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 3200);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingLending(null);
    setFormPersonName('');
    setFormAmount('');
    setFormNote('');
    setFormError(null);
    setFormModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lending: Lending) => {
    setEditingLending(lending);
    setFormPersonName(lending.personName);
    setFormAmount(lending.amount.toString());
    setFormNote(lending.note || '');
    setFormError(null);
    setFormModalVisible(true);
  };

  // Submit Add or Edit
  const handleSubmitForm = async () => {
    if (!formPersonName.trim()) {
      setFormError('Person name is required.');
      return;
    }
    const num = parseFloat(formAmount);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingLending) {
        await updateLending(editingLending.id, {
          personName: formPersonName.trim(),
          amount: num,
          note: formNote.trim() || undefined,
        });
        showBanner(`Updated lending for "${formPersonName.trim()}".`);
      } else {
        await createLending({
          personName: formPersonName.trim(),
          amount: num,
          note: formNote.trim() || undefined,
        });
        showBanner(`Recorded ₹${num.toLocaleString('en-IN')} lent to "${formPersonName.trim()}".`);
      }
      setFormModalVisible(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save lending record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Repayment Modal
  const handleOpenRepayment = (lending: Lending) => {
    setRepaymentTarget(lending);
    setRepaymentAmount('');
    setRepaymentNote('');
    setRepaymentError(null);
    setRepaymentModalVisible(true);
  };

  // Submit Repayment
  const handleSubmitRepayment = async () => {
    if (!repaymentTarget) return;

    const num = parseFloat(repaymentAmount);
    if (isNaN(num) || num <= 0) {
      setRepaymentError('Please enter a valid repayment amount greater than 0.');
      return;
    }

    if (num > repaymentTarget.remainingAmount) {
      setRepaymentError(
        `Amount cannot exceed remaining balance (₹${repaymentTarget.remainingAmount.toLocaleString('en-IN')}).`
      );
      return;
    }

    setIsSubmitting(true);
    setRepaymentError(null);
    try {
      await recordRepayment(repaymentTarget.id, {
        amount: num,
        note: repaymentNote.trim() || undefined,
      });
      showBanner(
        `Recorded ₹${num.toLocaleString('en-IN')} repaid by ${repaymentTarget.personName}.`
      );
      setRepaymentModalVisible(false);
    } catch (err: any) {
      setRepaymentError(err?.message || 'Failed to record repayment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (lending: Lending) => {
    setDeleteTarget(lending);
    setDeleteModalVisible(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await deleteLending(deleteTarget.id);
      showBanner(`Lending record for "${deleteTarget.personName}" deleted.`);
      setDeleteModalVisible(false);
    } catch (err: any) {
      showBanner(err?.message || 'Failed to delete record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge style helper
  const getStatusBadge = (status: LendingStatus) => {
    switch (status) {
      case 'FULLY_PAID':
        return {
          label: 'Fully Paid',
          bg: '#DCFCE7',
          color: '#166534',
        };
      case 'PARTIALLY_PAID':
        return {
          label: 'Partially Paid',
          bg: '#DBEAFE',
          color: '#1E40AF',
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending',
          bg: '#FEF3C7',
          color: '#92400E',
        };
    }
  };

  return (
    <ScreenContainer scrollable={false} edges={['top', 'bottom']}>
      {/* 1. Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <AppIcon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        <AppText variant="headingSm" color={colors.textPrimary} style={styles.headerTitle}>
          Money Lent (Lending)
        </AppText>

        <AppButton
          title="+ Lend"
          variant="primary"
          size="sm"
          onPress={handleOpenAdd}
          style={styles.addBtn}
        />
      </View>

      {/* 2. Success Banner */}
      {successBanner && (
        <View style={[styles.banner, { backgroundColor: colors.incomeSoft }]}>
          <AppIcon name="check-circle" size={18} color={colors.income} />
          <AppText
            variant="bodySmMedium"
            color={colors.income}
            style={{ marginLeft: spacing.xs, flex: 1 }}
          >
            {successBanner}
          </AppText>
        </View>
      )}

      {/* 3. Summary Row Cards */}
      <View style={styles.summaryContainer}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AppText variant="caption" color={colors.textSecondary}>
            Total Lent
          </AppText>
          <AppText variant="headingSm" color={colors.primary} weight="700">
            {formatExpenseAmount(summary.totalLent, { currency: settings.currency.code })}
          </AppText>
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AppText variant="caption" color={colors.textSecondary}>
            Returned
          </AppText>
          <AppText variant="headingSm" color={colors.income} weight="700">
            {formatExpenseAmount(summary.totalReturned, { currency: settings.currency.code })}
          </AppText>
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AppText variant="caption" color={colors.textSecondary}>
            Outstanding
          </AppText>
          <AppText
            variant="headingSm"
            color={summary.totalOutstanding > 0 ? colors.danger : colors.textPrimary}
            weight="700"
          >
            {formatExpenseAmount(summary.totalOutstanding, { currency: settings.currency.code })}
          </AppText>
        </View>
      </View>

      {/* 4. Search and Status Filter */}
      <View style={styles.controlsRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppIcon name="magnify" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search person..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <AppIcon name="close-circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {(
            [
              { label: 'All', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
              { label: 'Fully Paid', value: 'FULLY_PAID' },
            ] as const
          ).map((item) => {
            const isSelected = statusFilter === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setStatusFilter(item.value)}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && {
                    backgroundColor: colors.primarySoft,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? colors.primary : colors.textSecondary}
                  weight={isSelected ? '600' : '400'}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Lendings List */}
      <FlatList
        data={lendings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="hand-coin-outline"
              title={searchQuery ? 'No results found' : 'No money lent records'}
              description={
                searchQuery
                  ? `No records found matching "${searchQuery}".`
                  : 'Tap "+ Lend" above to record money you give or lend to someone.'
              }
              actionTitle="+ Lend Money"
              onActionPress={handleOpenAdd}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <AppCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.personRow}>
                  <View
                    style={[
                      styles.avatarWrapper,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <AppIcon name="account" size={20} color={colors.primary} />
                  </View>
                  <View style={{ marginLeft: spacing.sm }}>
                    <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
                      {item.personName}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {formattedDate}
                    </AppText>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <AppText variant="caption" color={badge.color} weight="600">
                    {badge.label}
                  </AppText>
                </View>
              </View>

              {/* Financial Progress Grid */}
              <View
                style={[
                  styles.metricRow,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <View style={styles.metricItem}>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Lent
                  </AppText>
                  <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
                    {formatExpenseAmount(item.amount, { currency: settings.currency.code })}
                  </AppText>
                </View>

                <View style={styles.metricItem}>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Returned
                  </AppText>
                  <AppText variant="bodyMdMedium" color={colors.income} weight="600">
                    {formatExpenseAmount(item.amountReturned, {
                      currency: settings.currency.code,
                    })}
                  </AppText>
                </View>

                <View style={styles.metricItem}>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Remaining
                  </AppText>
                  <AppText
                    variant="bodyMdMedium"
                    color={item.remainingAmount > 0 ? colors.danger : colors.textMuted}
                    weight="700"
                  >
                    {formatExpenseAmount(item.remainingAmount, {
                      currency: settings.currency.code,
                    })}
                  </AppText>
                </View>
              </View>

              {/* Note */}
              {item.note ? (
                <AppText
                  variant="caption"
                  color={colors.textSecondary}
                  style={styles.cardNote}
                  numberOfLines={2}
                >
                  Note: {item.note}
                </AppText>
              ) : null}

              {/* Card Actions */}
              <View style={styles.cardActionsRow}>
                {item.status !== 'FULLY_PAID' && (
                  <AppButton
                    title="Record Repayment"
                    variant="primary"
                    size="sm"
                    onPress={() => handleOpenRepayment(item)}
                    style={styles.repayBtn}
                  />
                )}

                <Pressable
                  onPress={() => handleOpenEdit(item)}
                  style={[styles.iconActionBtn, { borderColor: colors.border }]}
                  hitSlop={6}
                  accessibilityLabel="Edit record"
                >
                  <AppIcon name="pencil-outline" size={16} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => handleOpenDelete(item)}
                  style={[styles.iconActionBtn, { borderColor: colors.border }]}
                  hitSlop={6}
                  accessibilityLabel="Delete record"
                >
                  <AppIcon name="trash-can-outline" size={16} color={colors.danger} />
                </Pressable>
              </View>
            </AppCard>
          );
        }}
      />

      {/* 6. Add / Edit Lending Modal */}
      <Modal
        visible={formModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <AppText variant="headingSm" color={colors.textPrimary} style={{ marginBottom: spacing.md }}>
              {editingLending ? 'Edit Lending' : 'Lend Money'}
            </AppText>

            {formError && (
              <View style={[styles.modalErrorBanner, { backgroundColor: colors.dangerSoft }]}>
                <AppText variant="caption" color={colors.danger}>
                  {formError}
                </AppText>
              </View>
            )}

            <AppInput
              label="Person Name *"
              value={formPersonName}
              onChangeText={setFormPersonName}
              placeholder="e.g. Rahul, Priya, Alex"
            />

            <AppInput
              label="Amount Lent (₹) *"
              value={formAmount}
              onChangeText={setFormAmount}
              placeholder="e.g. 2000"
              keyboardType="decimal-pad"
            />

            <AppInput
              label="Note (Optional)"
              value={formNote}
              onChangeText={setFormNote}
              placeholder="e.g. Emergency loan, dinner split"
              multiline
            />

            <View style={styles.modalButtonRow}>
              <AppButton
                title="Cancel"
                variant="ghost"
                onPress={() => setFormModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton
                title={editingLending ? 'Save Changes' : 'Record Loan'}
                variant="primary"
                loading={isSubmitting}
                onPress={handleSubmitForm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Record Repayment Modal */}
      <Modal
        visible={repaymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepaymentModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <AppText variant="headingSm" color={colors.textPrimary}>
              Record Repayment
            </AppText>
            {repaymentTarget && (
              <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
                From: {repaymentTarget.personName} | Remaining:{' '}
                <AppText variant="caption" color={colors.danger} weight="700">
                  {formatExpenseAmount(repaymentTarget.remainingAmount, {
                    currency: settings.currency.code,
                  })}
                </AppText>
              </AppText>
            )}

            {repaymentError && (
              <View style={[styles.modalErrorBanner, { backgroundColor: colors.dangerSoft }]}>
                <AppText variant="caption" color={colors.danger}>
                  {repaymentError}
                </AppText>
              </View>
            )}

            <AppInput
              label="Repayment Amount (₹) *"
              value={repaymentAmount}
              onChangeText={setRepaymentAmount}
              placeholder={`Max: ${repaymentTarget?.remainingAmount || 0}`}
              keyboardType="decimal-pad"
            />

            <AppInput
              label="Note (Optional)"
              value={repaymentNote}
              onChangeText={setRepaymentNote}
              placeholder="e.g. Returned via GPay"
            />

            <View style={styles.modalButtonRow}>
              <AppButton
                title="Cancel"
                variant="ghost"
                onPress={() => setRepaymentModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton
                title="Save Repayment"
                variant="primary"
                loading={isSubmitting}
                onPress={handleSubmitRepayment}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <AppText variant="headingSm" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
              Delete Lending Record
            </AppText>
            <AppText variant="bodySm" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
              {`Are you sure you want to delete the record for "${deleteTarget?.personName || ''}"? This action cannot be undone.`}
            </AppText>

            <View style={styles.modalButtonRow}>
              <AppButton
                title="Cancel"
                variant="ghost"
                onPress={() => setDeleteModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton
                title="Delete"
                variant="danger"
                loading={isSubmitting}
                onPress={handleConfirmDelete}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  addBtn: {
    minWidth: 80,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  controlsRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterScroll: {
    marginBottom: spacing.xs,
  },
  filterScrollContent: {
    gap: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  cardNote: {
    marginVertical: spacing.xs,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  repayBtn: {
    marginRight: 'auto',
  },
  iconActionBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.high,
  },
  modalErrorBanner: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
