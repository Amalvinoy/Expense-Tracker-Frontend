import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { ExpenseCategoryInfo } from '../types/expense.types';
import { useCategoryStore } from '@/features/categories/store/category.store';
import { CategoryFormModal } from '@/features/categories/components/CategoryFormModal';
import { CreateCategoryPayload } from '@/features/categories/types/category.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface CategorySelectorProps {
  selectedCategoryId?: string;
  onSelectCategory: (category: ExpenseCategoryInfo) => void;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  error,
}) => {
  const { colors } = useAppTheme();
  const { categories, loadCategories, addCategory } = useCategoryStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeCategories = categories.filter(
    (c) => c.isActive && /^[0-9a-fA-F]{24}$/.test(c.id)
  );

  const handleOpenCreateCategory = () => {
    setCreateModalVisible(true);
  };

  const handleSaveCategory = async (payload: CreateCategoryPayload) => {
    const created = await addCategory(payload);
    // Real MongoDB 24-character hexadecimal ObjectId
    onSelectCategory({
      id: created.id,
      name: created.name,
      icon: created.icon,
      color: created.color,
      backgroundColor: created.backgroundColor,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="labelMd" color={colors.textPrimary}>
          Category
        </AppText>
        <View style={styles.headerRightRow}>
          {selectedCategoryId && (
            <AppText
              variant="caption"
              color={colors.primary}
              weight="600"
              style={{ marginRight: spacing.sm }}
            >
              Selected
            </AppText>
          )}
          <Pressable
            onPress={handleOpenCreateCategory}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add new category"
          >
            <AppText variant="caption" color={colors.primary} weight="600">
              + New Category
            </AppText>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.grid,
          error ? [styles.gridError, { borderColor: colors.danger }] : null,
        ]}
      >
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
                isSelected && { backgroundColor: colors.primarySoft },
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
                color={isSelected ? colors.primary : colors.textPrimary}
                weight={isSelected ? '600' : '400'}
                numberOfLines={1}
                style={styles.categoryName}
              >
                {category.name}
              </AppText>
            </Pressable>
          );
        })}

        {/* Shortcut to Add Category Directly */}
        <Pressable
          onPress={handleOpenCreateCategory}
          style={({ pressed }) => [
            styles.categoryCard,
            styles.addCard,
            { borderColor: colors.primaryLight },
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
      </View>

      {error && (
        <View style={styles.errorRow}>
          <AppIcon name="alert-circle-outline" size={14} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={{ marginLeft: spacing.xxs }}>
            {error}
          </AppText>
        </View>
      )}

      {/* Embedded Category Creation Modal */}
      <CategoryFormModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleSaveCategory}
      />
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
  headerRightRow: {
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
  iconWrapper: {
    position: 'relative',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    borderRadius: radius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  categoryName: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
  },
  addCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
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
