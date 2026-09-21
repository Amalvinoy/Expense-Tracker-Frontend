import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { formatExpenseDate } from '../utils/expense.utils';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface DateSelectorProps {
  value: string; // ISO string
  onChangeDate: (dateISO: string) => void;
  error?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChangeDate,
  error,
}) => {
  const { colors } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);
  const currentDate = value ? new Date(value) : new Date();

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      onChangeDate(selectedDate.toISOString());
    }
  };

  const handleSetToday = () => {
    onChangeDate(new Date().toISOString());
  };

  const handleSetYesterday = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    onChangeDate(yesterday.toISOString());
  };

  return (
    <View style={styles.container}>
      <AppText variant="labelMd" color={colors.textPrimary} style={styles.label}>
        Date
      </AppText>

      {/* Main Date Picker Trigger Card */}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.dateCard,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
          pressed && { opacity: 0.8 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <View style={styles.leftRow}>
          <AppIcon name="calendar-month-outline" size={20} color={colors.primary} />
          <AppText variant="bodyMdMedium" style={{ color: colors.textPrimary }}>
            {formatExpenseDate(currentDate)}
          </AppText>
        </View>

        <AppIcon name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      {/* Quick Shortcuts */}
      <View style={styles.presetsRow}>
        <Pressable
          onPress={handleSetToday}
          style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]}
          hitSlop={6}
        >
          <AppText variant="caption" color={colors.primary} weight="600">
            Today
          </AppText>
        </Pressable>
        <Pressable
          onPress={handleSetYesterday}
          style={[styles.presetPill, { backgroundColor: colors.surfaceVariant }]}
          hitSlop={6}
        >
          <AppText variant="caption" color={colors.textSecondary} weight="500">
            Yesterday
          </AppText>
        </Pressable>
      </View>

      {/* Native DateTimePicker */}
      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()} // Prevent future expense entry
          onChange={handlePickerChange}
        />
      )}

      {error && (
        <AppText variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs + 2,
  },
  presetPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    minHeight: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  errorText: {
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

