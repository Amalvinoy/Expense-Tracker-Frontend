import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { ReportTimeRange, DateRange } from '../types/report.types';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';
import { format, parseISO, isValid } from 'date-fns';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

export interface ReportTimeFilterBarProps {
  selectedRange: ReportTimeRange;
  onSelectRange: (range: ReportTimeRange) => void;
  customRange: DateRange;
  onUpdateCustomRange: (range: DateRange) => void;
  dateRangeLabel: string;
}

export const ReportTimeFilterBar: React.FC<ReportTimeFilterBarProps> = ({
  selectedRange,
  onSelectRange,
  customRange,
  onUpdateCustomRange,
  dateRangeLabel,
}) => {
  const { colors } = useAppTheme();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    isValid(parseISO(customRange.startDate)) ? parseISO(customRange.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    isValid(parseISO(customRange.endDate)) ? parseISO(customRange.endDate) : new Date()
  );

  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  const filterOptions: { key: ReportTimeRange; label: string }[] = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3 Months' },
    { key: 'custom', label: 'Custom' },
  ];

  const handleChipPress = (key: ReportTimeRange) => {
    if (key === 'custom') {
      setCustomModalVisible(true);
    } else {
      onSelectRange(key);
    }
  };

  const handleApplyCustomRange = () => {
    onUpdateCustomRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    onSelectRange('custom');
    setCustomModalVisible(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      const picker = activePicker;
      setActivePicker(null);
      if (event.type === 'set' && selected) {
        if (picker === 'start') setStartDate(selected);
        if (picker === 'end') setEndDate(selected);
      }
    } else if (selected) {
      if (activePicker === 'start') setStartDate(selected);
      if (activePicker === 'end') setEndDate(selected);
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterOptions.map((opt) => {
          const isSelected = selectedRange === opt.key;

          return (
            <Pressable
              key={opt.key}
              onPress={() => handleChipPress(opt.key)}
              style={[
                styles.chip,
                isSelected
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              {opt.key === 'custom' && (
                <AppIcon
                  name="calendar-range-outline"
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
              )}
              <AppText
                variant="bodySmMedium"
                color={isSelected ? '#FFFFFF' : colors.textSecondary}
                weight={isSelected ? '600' : '500'}
              >
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Current Range Subtitle */}
      <View style={styles.labelRow}>
        <AppIcon name="calendar-clock" size={14} color={colors.primary} />
        <AppText
          variant="caption"
          color={colors.textSecondary}
          weight="500"
          style={{ marginLeft: 4 }}
        >
          Period: <AppText variant="caption" weight="600" color={colors.textPrimary}>{dateRangeLabel}</AppText>
        </AppText>
      </View>

      {/* Custom Range Picker Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <AppText variant="headingSm">Select Custom Range</AppText>
              <Pressable
                onPress={() => setCustomModalVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <AppIcon name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Date Pickers */}
            <View style={styles.pickerSection}>
              {/* Start Date */}
              <View style={styles.dateField}>
                <AppText variant="labelMd" color={colors.textSecondary} style={{ marginBottom: 4 }}>
                  Start Date
                </AppText>
                <Pressable
                  onPress={() => setActivePicker('start')}
                  style={[
                    styles.dateButton,
                    { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                  ]}
                >
                  <AppIcon name="calendar" size={18} color={colors.primary} />
                  <AppText variant="bodyMdMedium" style={{ marginLeft: spacing.xs }}>
                    {format(startDate, 'MMM d, yyyy')}
                  </AppText>
                </Pressable>
              </View>

              {/* End Date */}
              <View style={styles.dateField}>
                <AppText variant="labelMd" color={colors.textSecondary} style={{ marginBottom: 4 }}>
                  End Date
                </AppText>
                <Pressable
                  onPress={() => setActivePicker('end')}
                  style={[
                    styles.dateButton,
                    { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                  ]}
                >
                  <AppIcon name="calendar" size={18} color={colors.primary} />
                  <AppText variant="bodyMdMedium" style={{ marginLeft: spacing.xs }}>
                    {format(endDate, 'MMM d, yyyy')}
                  </AppText>
                </Pressable>
              </View>
            </View>

            {/* Active DateTimePicker */}
            {activePicker && (
              <View style={[styles.nativePickerBox, { backgroundColor: colors.surfaceVariant }]}>
                <DateTimePicker
                  value={activePicker === 'start' ? startDate : endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
                {Platform.OS === 'ios' && (
                  <AppButton
                    title="Done"
                    variant="outline"
                    size="sm"
                    onPress={() => setActivePicker(null)}
                    style={{ alignSelf: 'flex-end', marginTop: 8 }}
                  />
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.modalFooter}>
              <View style={{ flex: 1, marginRight: spacing.xs }}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setCustomModalVisible(false)}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <AppButton
                  title="Apply Filter"
                  variant="primary"
                  size="md"
                  onPress={handleApplyCustomRange}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  nativePickerBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
});

