import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { CurrencyOption } from '../types/settings.types';
import { SUPPORTED_CURRENCIES } from '../constants/settings.constants';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';

export interface CurrencyPickerModalProps {
  visible: boolean;
  selectedCurrency: CurrencyOption;
  onSelectCurrency: (currency: CurrencyOption) => void;
  onClose: () => void;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  selectedCurrency,
  onSelectCurrency,
  onClose,
}) => {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm">Select Currency</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Choose your primary reporting currency
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Currencies List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SUPPORTED_CURRENCIES.map((curr, idx) => {
              const isSelected = selectedCurrency.code === curr.code;
              const isLast = idx === SUPPORTED_CURRENCIES.length - 1;

              return (
                <Pressable
                  key={curr.code}
                  onPress={() => {
                    onSelectCurrency(curr);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.itemRow,
                    pressed && { backgroundColor: colors.surfaceVariant },
                    isSelected && { backgroundColor: colors.primarySoft },
                    !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.symbolBadge, { backgroundColor: colors.surfaceVariant }]}>
                    <AppText variant="headingSm" color={colors.primary} weight="700">
                      {curr.symbol}
                    </AppText>
                  </View>

                  <View style={styles.nameCol}>
                    <AppText variant="bodyMdMedium" weight="600">
                      {curr.name}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {curr.code} • {curr.locale}
                    </AppText>
                  </View>

                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <AppIcon name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    maxHeight: '75%',
    paddingBottom: spacing.xl,
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  symbolBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nameCol: {
    flex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

