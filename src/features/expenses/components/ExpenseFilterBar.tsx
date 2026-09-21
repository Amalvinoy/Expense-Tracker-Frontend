import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useCategoryStore } from '@/features/categories/store/category.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export type DateFilterPreset = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export interface ExpenseFilterBarProps {
  selectedDatePreset: DateFilterPreset;
  onSelectDatePreset: (preset: DateFilterPreset) => void;
  selectedCategoryId?: string;
  onSelectCategoryId: (categoryId?: string) => void;
  onOpenSortModal: () => void;
  onOpenCustomDateModal?: () => void;
}

const datePresetOptions: { label: string; value: DateFilterPreset }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  selectedDatePreset,
  onSelectDatePreset,
  selectedCategoryId,
  onSelectCategoryId,
  onOpenSortModal,
  onOpenCustomDateModal,
}) => {
  const { colors } = useAppTheme();
  const { categories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeCategories = categories.filter(
    (c) => c.isActive && /^[0-9a-fA-F]{24}$/.test(c.id)
  );

  return (
    <View style={styles.container}>
      {/* Date Presets + Sort Action Button */}
      <View style={styles.topControlsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScrollView}
          contentContainerStyle={styles.dateScrollContent}
        >
          {datePresetOptions.map((opt) => {
            const isSelected = selectedDatePreset === opt.value;

            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelectDatePreset(opt.value);
                  if (opt.value === 'custom' && onOpenCustomDateModal) {
                    onOpenCustomDateModal();
                  }
                }}
                style={[
                  styles.pill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySoft,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? colors.primary : colors.textSecondary}
                  weight={isSelected ? '600' : '400'}
                  numberOfLines={1}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={onOpenSortModal}
          style={[
            styles.sortButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Sort expenses"
        >
          <AppIcon name="sort-variant" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Category Pills Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <Pressable
          onPress={() => onSelectCategoryId(undefined)}
          style={[
            styles.categoryPill,
            { backgroundColor: colors.surfaceVariant },
            !selectedCategoryId && { backgroundColor: colors.primary },
          ]}
          accessibilityRole="button"
        >
          <AppText
            variant="caption"
            color={!selectedCategoryId ? '#FFFFFF' : colors.textSecondary}
            weight={!selectedCategoryId ? '600' : '400'}
          >
            All Categories
          </AppText>
        </Pressable>

        {activeCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategoryId(isSelected ? undefined : cat.id)}
              style={[
                styles.categoryPill,
                { backgroundColor: colors.surfaceVariant },
                isSelected && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
            >
              <AppText
                variant="caption"
                color={isSelected ? '#FFFFFF' : colors.textPrimary}
                weight={isSelected ? '600' : '400'}
              >
                {cat.name}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  dateScrollView: {
    flex: 1,
  },
  dateScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sortButton: {
    width: 36,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    flexShrink: 0,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  categoryPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    minHeight: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

