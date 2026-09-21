import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Category } from '../types/category.types';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AppCard } from '@/components/common/AppCard';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { spacing, radius } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface CategoryCardProps {
  category: Category;
  expenseCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  expenseCount,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { colors } = useAppTheme();

  return (
    <AppCard
      variant="outlined"
      style={[
        styles.card,
        !category.isActive && [styles.cardInactive, { backgroundColor: colors.surfaceVariant }],
      ]}
    >
      <View style={styles.cardContent}>
        {/* Left: Category Icon */}
        <View style={styles.iconContainer}>
          <CategoryIcon
            category={category.name}
            iconName={category.icon}
            color={category.color}
            backgroundColor={category.backgroundColor}
            size="md"
          />
        </View>

        {/* Center: Details */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <AppText
              variant="bodyMdMedium"
              color={category.isActive ? colors.textPrimary : colors.textMuted}
              weight="600"
              style={styles.nameText}
              numberOfLines={1}
            >
              {category.name}
            </AppText>

            {category.isDefault ? (
              <View style={[styles.defaultBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <AppText variant="caption" color={colors.textSecondary} weight="500">
                  System
                </AppText>
              </View>
            ) : (
              <View style={[styles.customBadge, { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight }]}>
                <AppText variant="caption" color={colors.primary} weight="500">
                  Custom
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <AppText variant="caption" color={colors.textSecondary}>
              {expenseCount === 0
                ? 'No transactions'
                : `${expenseCount} transaction${expenseCount === 1 ? '' : 's'}`}
            </AppText>

            {!category.isActive && (
              <View style={[styles.inactiveChip, { backgroundColor: colors.warningSoft }]}>
                <AppText variant="caption" color={colors.warning} weight="600">
                  Hidden
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Right: Actions */}
        <View style={styles.actionsContainer}>
          {/* Active/Inactive Toggle Button */}
          <Pressable
            onPress={() => onToggleActive(category)}
            style={styles.actionIconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={category.isActive ? 'Hide category' : 'Show category'}
          >
            <AppIcon
              name={category.isActive ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={category.isActive ? colors.textSecondary : colors.warning}
            />
          </Pressable>

          {/* Edit Button (Available for all custom categories & allows custom color adjustments) */}
          <Pressable
            onPress={() => onEdit(category)}
            style={styles.actionIconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${category.name}`}
          >
            <AppIcon name="pencil-outline" size={18} color={colors.primary} />
          </Pressable>

          {/* Delete Button (Allowed only for custom categories) */}
          {!category.isDefault && (
            <Pressable
              onPress={() => onDelete(category)}
              style={styles.actionIconButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${category.name}`}
            >
              <AppIcon name="trash-can-outline" size={18} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardInactive: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    marginRight: spacing.xs,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inactiveChip: {
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  actionIconButton: {
    padding: spacing.xs,
    marginLeft: 2,
    borderRadius: radius.sm,
  },
});
