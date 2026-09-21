import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { AppInput } from '@/components/common/AppInput';
import { EmptyState } from '@/components/feedback/EmptyState';
import {
  Category,
  CreateCategoryPayload,
  useCategoryStore,
  CategoryCard,
  CategoryFormModal,
} from '@/features/categories';
import { useExpenseStore } from '@/store/expense.store';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    categories,
    loadCategories,
    addCategory,
    updateCategory,
    toggleCategoryActive,
    canDeleteCategory,
    deleteCategory,
  } = useCategoryStore();

  const { expenses } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Deletion modals state
  const [inUseWarningModal, setInUseWarningModal] = useState<{
    visible: boolean;
    categoryName: string;
    expenseCount: number;
  }>({
    visible: false,
    categoryName: '',
    expenseCount: 0,
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    category: Category | null;
  }>({
    visible: false,
    category: null,
  });

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Compute expense count per category id/name
  const expenseCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + 1;
      const lowerName = e.categoryName.toLowerCase();
      map[lowerName] = (map[lowerName] || 0) + 1;
    });
    return map;
  }, [expenses]);

  const getExpenseCountForCategory = (cat: Category): number => {
    return expenseCountMap[cat.id] || expenseCountMap[cat.name.toLowerCase()] || 0;
  };

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const activeCategories = useMemo(
    () => filteredCategories.filter((c) => c.isActive),
    [filteredCategories]
  );

  const inactiveCategories = useMemo(
    () => filteredCategories.filter((c) => !c.isActive),
    [filteredCategories]
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormModalVisible(true);
  };

  const handleDeleteRequest = (cat: Category) => {
    const validation = canDeleteCategory(cat.id);
    if (!validation.canDelete) {
      setInUseWarningModal({
        visible: true,
        categoryName: cat.name,
        expenseCount: validation.expenseCount,
      });
      return;
    }

    setDeleteConfirmModal({
      visible: true,
      category: cat,
    });
  };

  const performDelete = async (cat: Category) => {
    const res = await deleteCategory(cat.id);
    if (res.canDelete) {
      showNotificationBanner(`Category "${cat.name}" permanently removed.`);
    } else {
      showNotificationBanner(res.message || `Failed to delete category "${cat.name}".`);
    }
    setDeleteConfirmModal({ visible: false, category: null });
  };

  const handleToggleActive = async (cat: Category) => {
    await toggleCategoryActive(cat.id);
    showNotificationBanner(
      `"${cat.name}" is now ${!cat.isActive ? 'active' : 'hidden from selection lists'}.`
    );
  };

  const handleSaveCategory = async (payload: CreateCategoryPayload) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
      showNotificationBanner(`Category "${payload.name}" updated successfully.`);
    } else {
      await addCategory(payload);
      showNotificationBanner(`Category "${payload.name}" created successfully.`);
    }
  };

  const showNotificationBanner = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 3200);
  };

  return (
    <ScreenContainer
      scrollable={false}
      withPadding={false}
      header={
        <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>

          <AppText variant="headingSm" color={colors.textPrimary} style={styles.navTitle}>
            Categories
          </AppText>

          <Pressable
            onPress={handleOpenAddModal}
            style={[styles.addNavButton, { backgroundColor: colors.primarySoft }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add category"
          >
            <AppIcon name="plus" size={22} color={colors.primary} />
          </Pressable>
        </View>
      }
    >
      {/* Success Notification Banner */}
      {successBanner && (
        <View style={[styles.successBanner, { backgroundColor: colors.successSoft, borderColor: colors.incomeLight }]}>
          <AppIcon name="check-circle" size={20} color={colors.success} />
          <AppText
            variant="bodyMdMedium"
            color={colors.success}
            style={{ marginLeft: spacing.xs, flex: 1 }}
          >
            {successBanner}
          </AppText>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <AppIcon name="magnify" size={20} color={colors.textSecondary} />
          }
          rightIcon={
            searchQuery.length > 0 ? (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <AppIcon name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null
          }
        />
      </View>

      {/* Main Categories FlatList */}
      <FlatList
        data={activeCategories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          activeCategories.length > 0 ? (
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.sectionHeader}>
              ACTIVE CATEGORIES ({activeCategories.length})
            </AppText>
          ) : null
        }
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            expenseCount={getExpenseCountForCategory(item)}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteRequest}
            onToggleActive={handleToggleActive}
          />
        )}
        ListFooterComponent={
          inactiveCategories.length > 0 ? (
            <View style={[styles.inactiveSectionContainer, { borderTopColor: colors.divider }]}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.sectionHeader}>
                HIDDEN / ARCHIVED CATEGORIES ({inactiveCategories.length})
              </AppText>
              {inactiveCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  expenseCount={getExpenseCountForCategory(cat)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteRequest}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="shape-outline"
            title={searchQuery ? 'No Matching Categories' : 'No Categories Found'}
            description={
              searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword.`
                : 'Create custom categories to organize your expenses.'
            }
            actionTitle={searchQuery ? 'Clear Search' : '+ Add Category'}
            onActionPress={searchQuery ? () => setSearchQuery('') : handleOpenAddModal}
            style={{ marginTop: spacing.xl }}
          />
        }
      />

      {/* Add / Edit Form Modal */}
      <CategoryFormModal
        visible={formModalVisible}
        categoryToEdit={editingCategory}
        onClose={() => setFormModalVisible(false)}
        onSave={handleSaveCategory}
      />

      {/* In-Use Deletion Prevention Warning Modal */}
      <Modal
        visible={inUseWarningModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setInUseWarningModal({ visible: false, categoryName: '', expenseCount: 0 })
        }
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.warningIconCircle, { backgroundColor: colors.warningSoft }]}>
              <AppIcon name="alert-octagon" size={32} color={colors.warning} />
            </View>

            <AppText variant="headingSm" color={colors.textPrimary} style={styles.modalTitle}>
              Cannot Delete Category
            </AppText>

            <AppText variant="bodyMd" color={colors.textSecondary} style={styles.modalMessage}>
              <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
                &ldquo;{inUseWarningModal.categoryName}&rdquo;
              </AppText>{' '}
              is currently associated with{' '}
              <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="700">
                {inUseWarningModal.expenseCount} recorded transaction
                {inUseWarningModal.expenseCount === 1 ? '' : 's'}
              </AppText>
              .{'\n\n'}
              To preserve your financial records and summary reports, you cannot delete a category that is in active use.
            </AppText>

            <AppButton
              title="Understood"
              variant="primary"
              size="md"
              onPress={() =>
                setInUseWarningModal({ visible: false, categoryName: '', expenseCount: 0 })
              }
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModal({ visible: false, category: null })}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.dangerIconCircle, { backgroundColor: colors.dangerSoft }]}>
              <AppIcon name="trash-can-outline" size={32} color={colors.danger} />
            </View>

            <AppText variant="headingSm" color={colors.textPrimary} style={styles.modalTitle}>
              Delete Category?
            </AppText>

            <AppText variant="bodyMd" color={colors.textSecondary} style={styles.modalMessage}>
              Are you sure you want to delete{' '}
              <AppText variant="bodyMdMedium" weight="600" color={colors.textPrimary}>
                &ldquo;{deleteConfirmModal.category?.name}&rdquo;
              </AppText>
              ? This category will be permanently removed. This action cannot be undone.
            </AppText>

            <View style={styles.modalButtonsRow}>
              <View style={{ flex: 1, marginRight: spacing.xs }}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setDeleteConfirmModal({ visible: false, category: null })}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <AppButton
                  title="Delete"
                  variant="danger"
                  size="md"
                  onPress={() => {
                    if (deleteConfirmModal.category) {
                      performDelete(deleteConfirmModal.category);
                    }
                  }}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: spacing.xxs,
  },
  navTitle: {
    fontWeight: '700',
  },
  addNavButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inactiveSectionContainer: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.high,
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dangerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
