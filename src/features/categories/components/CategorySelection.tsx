import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { useCategoryStore } from '../store/category.store';
import { spacing, radius } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface CategorySelectionProps {
  selectedCategoryId?: string;
  onSelectCategory: (category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    backgroundColor: string;
  }) => void;
  error?: string;
  showManageButton?: boolean;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  selectedCategoryId,
  onSelectCategory,
  error,
  showManageButton = true,
}) => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { categories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeCategories = categories.filter((c) => c.isActive);

  const handleManagePress = () => {
    router.push('/categories' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="labelMd" color={colors.textPrimary}>
          Category
        </AppText>
        <View style={styles.rightHeaderRow}>
          {selectedCategoryId && (
            <AppText variant="caption" color={colors.primary} weight="600" style={{ marginRight: spacing.sm }}>
              Selected
            </AppText>
          )}
          {showManageButton && (
            <Pressable
              onPress={handleManagePress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Manage categories"
            >
              <AppText variant="caption" color={colors.primary} weight="600">
                Manage
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.grid, error ? [styles.gridError, { borderColor: colors.danger }] : null]}>
        {activeCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <Pressable
              key={category.id}
              onPress={() =>
                onSelectCategory({
                  id: category.id,
                  name: category.name,
                  icon: category.icon,
                  color: category.color,
                  backgroundColor: category.backgroundColor,
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                isSelected && [styles.categoryCardSelected, { backgroundColor: colors.primarySoft }],
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.iconWrapper}>
                <CategoryIcon
                  category={category.name}
                  iconName={category.icon}
                  color={category.color}
                  backgroundColor={category.backgroundColor}
                  size="md"
                />
                {isSelected && (
                  <View style={[styles.checkmarkBadge, { backgroundColor: colors.primary }]}>
                    <AppIcon name="check" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <AppText
                variant="caption"
                color={isSelected ? colors.primary : colors.textSecondary}
                weight={isSelected ? '600' : '400'}
                numberOfLines={1}
                style={styles.categoryName}
              >
                {category.name}
              </AppText>
            </Pressable>
          );
        })}

        {/* Add New Category Shortcut Card */}
        {showManageButton && (
          <Pressable
            onPress={handleManagePress}
            style={({ pressed }) => [
              styles.categoryCard,
              styles.addCard,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add new category"
          >
            <View style={[styles.addIconCircle, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="plus" size={20} color={colors.primary} />
            </View>
            <AppText
              variant="caption"
              color={colors.primary}
              weight="500"
              numberOfLines={1}
              style={styles.categoryName}
            >
              Add New
            </AppText>
          </Pressable>
        )}
      </View>

      {error && (
        <View style={styles.errorRow}>
          <AppIcon name="alert-circle-outline" size={14} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={{ marginLeft: spacing.xxs }}>
            {error}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  rightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    borderRadius: radius.md,
    padding: 2,
  },
  gridError: {
    borderWidth: 1,
    padding: 4,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: radius.md,
  },
  categoryCardSelected: {
  },
  iconWrapper: {
    position: 'relative',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  categoryName: {
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 72,
  },
  addCard: {
    opacity: 0.9,
  },
  addIconCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
