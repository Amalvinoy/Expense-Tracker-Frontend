import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks';
import { spacing, radius, shadows } from '@/constants';
import { MonthlyIncome } from '../types/income.types';
import { formatMonthYear } from '../utils/income.utils';
import { useIncomeStore } from '../store/income.store';

interface IncomeFormModalProps {
  visible: boolean;
  onClose: () => void;
  year: number;
  month: number;
  initialIncome?: MonthlyIncome | null;
  onSuccess?: (saved: MonthlyIncome) => void;
}

interface IncomeFormContentProps {
  onClose: () => void;
  year: number;
  month: number;
  initialIncome?: MonthlyIncome | null;
  onSuccess?: (saved: MonthlyIncome) => void;
}

const IncomeFormContent: React.FC<IncomeFormContentProps> = ({
  onClose,
  year,
  month,
  initialIncome,
  onSuccess,
}) => {
  const { colors } = useAppTheme();
  const { saveIncome, deleteIncome, isSaving } = useIncomeStore();

  const [amount, setAmount] = useState(
    initialIncome?.amount ? initialIncome.amount.toString() : ''
  );
  const [source, setSource] = useState(initialIncome?.source || '');
  const [note, setNote] = useState(initialIncome?.note || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);
    const numAmount = parseFloat(amount.trim());
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid income amount greater than zero.');
      return;
    }

    try {
      const saved = await saveIncome({
        year,
        month,
        amount: Math.round(numAmount * 100) / 100,
        source: source.trim() || undefined,
        note: note.trim() || undefined,
      });

      onSuccess?.(saved);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save monthly income.');
    }
  };

  const handleDelete = () => {
    if (!initialIncome) return;
    Alert.alert(
      'Remove Income',
      `Are you sure you want to remove the recorded income for ${formatMonthYear(year, month)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncome(initialIncome.id);
              onClose();
            } catch (err: any) {
              setErrorMessage(err?.message || 'Failed to delete income.');
            }
          },
        },
      ]
    );
  };

  const monthLabel = formatMonthYear(year, month);
  const isEditing = !!initialIncome;

  return (
    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: `${colors.primary}18` },
            ]}
          >
            <AppIcon name="wallet" size={22} color={colors.primary} />
          </View>
          <View>
            <AppText variant="h3" style={{ color: colors.textPrimary }}>
              {isEditing ? 'Edit Income' : 'Add Income'}
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              {monthLabel}
            </AppText>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <AppIcon name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.expenseSoft,
                borderColor: colors.expense,
              },
            ]}
          >
            <AppIcon name="alert-circle" size={16} color={colors.expense} />
            <AppText
              variant="caption"
              style={{ color: colors.expense, flex: 1, marginLeft: 6 }}
            >
              {errorMessage}
            </AppText>
          </View>
        ) : null}

        {/* Income Amount */}
        <AppInput
          label="Monthly Income Amount (₹)"
          placeholder="e.g. 30000"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          leftIcon={<AppIcon name="cash-outline" size={18} color={colors.primary} />}
        />

        {/* Source */}
        <AppInput
          label="Income Source (Optional)"
          placeholder="e.g. Salary, Freelancing, Business"
          value={source}
          onChangeText={setSource}
          leftIcon={<AppIcon name="briefcase-outline" size={18} color={colors.textSecondary} />}
        />

        {/* Note */}
        <AppInput
          label="Note (Optional)"
          placeholder="Additional notes for this month..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
          leftIcon={<AppIcon name="document-text-outline" size={18} color={colors.textSecondary} />}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            title={isEditing ? 'Update Income' : 'Save Income'}
            onPress={handleSave}
            loading={isSaving}
            variant="primary"
            style={styles.saveBtn}
          />

          {isEditing ? (
            <AppButton
              title="Remove Income"
              onPress={handleDelete}
              variant="secondary"
              style={[styles.deleteBtn, { borderColor: colors.expense }]}
              textStyle={{ color: colors.expense }}
              disabled={isSaving}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  visible,
  onClose,
  year,
  month,
  initialIncome,
  onSuccess,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <IncomeFormContent
          key={`${year}-${month}-${initialIncome?.id || 'new'}`}
          onClose={onClose}
          year={year}
          month={month}
          initialIncome={initialIncome}
          onSuccess={onSuccess}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    maxHeight: '85%',
    ...shadows.high,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  saveBtn: {
    width: '100%',
  },
  deleteBtn: {
    width: '100%',
    borderWidth: 1,
  },
});
