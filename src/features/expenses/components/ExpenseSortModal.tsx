import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export type ExpenseSortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface ExpenseSortModalProps {
  visible: boolean;
  selectedSort: ExpenseSortOption;
  onSelectSort: (option: ExpenseSortOption) => void;
  onClose: () => void;
}

const sortOptions: { label: string; value: ExpenseSortOption; icon: string }[] = [
  { label: 'Newest First (Default)', value: 'newest', icon: 'sort-calendar-descending' },
  { label: 'Oldest First', value: 'oldest', icon: 'sort-calendar-ascending' },
  { label: 'Highest Amount', value: 'highest', icon: 'sort-numeric-descending' },
  { label: 'Lowest Amount', value: 'lowest', icon: 'sort-numeric-ascending' },
];

export const ExpenseSortModal: React.FC<ExpenseSortModalProps> = ({
  visible,
  selectedSort,
  onSelectSort,
  onClose,
}) => {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.headerRow, { borderBottomColor: colors.divider }]}>
            <AppText variant="headingSm">Sort Expenses</AppText>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.optionsList}>
            {sortOptions.map((opt) => {
              const isSelected = selectedSort === opt.value;

              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onSelectSort(opt.value);
                    onClose();
                  }}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primarySoft },
                  ]}
                  accessibilityRole="button"
                >
                  <View style={styles.optionLeft}>
                    <AppIcon
                      name={opt.icon}
                      size={20}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <AppText
                      variant="bodyMd"
                      color={isSelected ? colors.primary : colors.textPrimary}
                      weight={isSelected ? '600' : '400'}
                      style={{ marginLeft: spacing.sm }}
                    >
                      {opt.label}
                    </AppText>
                  </View>

                  {isSelected && (
                    <AppIcon name="check" size={18} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

