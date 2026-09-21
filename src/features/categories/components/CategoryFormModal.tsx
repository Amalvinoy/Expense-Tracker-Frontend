import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Category,
  CreateCategoryPayload,
  ColorPreset,
} from '../types/category.types';
import {
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_COLOR_PRESETS,
} from '../constants/category.constants';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface CategoryFormModalProps {
  visible: boolean;
  categoryToEdit?: Category | null;
  onClose: () => void;
  onSave: (data: CreateCategoryPayload) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const { colors } = useAppTheme();
  const isEditing = !!categoryToEdit;

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_CATEGORY_ICONS[0].name);
  const [selectedColorPreset, setSelectedColorPreset] = useState<ColorPreset>(
    AVAILABLE_COLOR_PRESETS[0]
  );
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevCategoryToEdit, setPrevCategoryToEdit] = useState(categoryToEdit);

  if (visible !== prevVisible || categoryToEdit !== prevCategoryToEdit) {
    setPrevVisible(visible);
    setPrevCategoryToEdit(categoryToEdit);
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedIcon(categoryToEdit.icon);
      const matchedColor =
        AVAILABLE_COLOR_PRESETS.find(
          (preset) => preset.color.toLowerCase() === categoryToEdit.color.toLowerCase()
        ) || {
          id: 'custom',
          name: 'Custom',
          color: categoryToEdit.color,
          backgroundColor: categoryToEdit.backgroundColor,
        };
      setSelectedColorPreset(matchedColor);
      setIsActive(categoryToEdit.isActive);
    } else {
      setName('');
      setSelectedIcon(AVAILABLE_CATEGORY_ICONS[0].name);
      setSelectedColorPreset(AVAILABLE_COLOR_PRESETS[0]);
      setIsActive(true);
    }
    setNameError(null);
  }

  const handleFormSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Category name is required.');
      return;
    }

    if (trimmed.length < 2) {
      setNameError('Category name must be at least 2 characters.');
      return;
    }

    if (trimmed.length > 30) {
      setNameError('Category name cannot exceed 30 characters.');
      return;
    }

    setIsSubmitting(true);
    setNameError(null);

    try {
      await onSave({
        name: trimmed,
        icon: selectedIcon,
        color: selectedColorPreset.color,
        backgroundColor: selectedColorPreset.backgroundColor,
        isActive,
      });
      onClose();
    } catch (err: any) {
      setNameError(err?.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
        />

        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm" color={colors.textPrimary}>
                {isEditing ? 'Edit Category' : 'New Category'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {isEditing
                  ? 'Update category color, icon, or active status'
                  : 'Add a custom category to organize your spending'}
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Form Fields ScrollView */}
          <ScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Live Icon Preview Badge */}
            <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
              <CategoryIcon
                category={name.trim() || 'Preview'}
                iconName={selectedIcon}
                color={selectedColorPreset.color}
                backgroundColor={selectedColorPreset.backgroundColor}
                size="lg"
              />
              <AppText
                variant="bodyMdMedium"
                weight="700"
                color={colors.textPrimary}
                style={styles.previewLabel}
              >
                {name.trim() || 'Category Name'}
              </AppText>
            </View>

            {/* 2. Category Name Input */}
            <View style={styles.section}>
              <AppInput
                label="Category Name"
                placeholder="e.g. Subscriptions, Hobbies, Gym"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(null);
                }}
                error={nameError || undefined}
                autoFocus={!isEditing}
                maxLength={30}
              />
            </View>

            {/* 3. Color Palette Swatches */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="labelMd" color={colors.textPrimary} style={styles.sectionTitle}>
                  Accent Color
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {selectedColorPreset.name}
                </AppText>
              </View>

              <View style={styles.colorPaletteGrid}>
                {AVAILABLE_COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColorPreset.color === preset.color;

                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => setSelectedColorPreset(preset)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: preset.backgroundColor },
                        isSelected && [
                          styles.colorSwatchSelected,
                          { borderColor: preset.color },
                        ],
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={preset.name}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: preset.color },
                        ]}
                      />
                      {isSelected && (
                        <View style={styles.colorCheckmark}>
                          <AppIcon name="check" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. Icon Picker */}
            <View style={styles.section}>
              <AppText variant="labelMd" color={colors.textPrimary} style={styles.sectionTitle}>
                Select Icon
              </AppText>

              <View style={styles.iconGrid}>
                {AVAILABLE_CATEGORY_ICONS.map((item) => {
                  const isSelected = selectedIcon === item.name;

                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => setSelectedIcon(item.name)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: isSelected ? selectedColorPreset.backgroundColor : colors.surfaceVariant,
                          borderColor: isSelected ? selectedColorPreset.color : colors.border,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <AppIcon
                        name={item.name}
                        size={22}
                        color={isSelected ? selectedColorPreset.color : colors.textSecondary}
                      />
                      <AppText
                        variant="caption"
                        color={isSelected ? colors.textPrimary : colors.textSecondary}
                        numberOfLines={1}
                        style={styles.iconOptionLabel}
                      >
                        {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 5. Active Status Option */}
            <View style={styles.activeStatusRow}>
              <View>
                <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600">
                  Visible in Expenses
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {isActive
                    ? 'Category will appear in dropdowns and filter lists'
                    : 'Category is archived/hidden from selection lists'}
                </AppText>
              </View>

              <Pressable
                onPress={() => setIsActive(!isActive)}
                style={[
                  styles.toggleButton,
                  isActive
                    ? [styles.toggleButtonActive, { backgroundColor: colors.primary }]
                    : [styles.toggleButtonInactive, { backgroundColor: colors.surfaceVariant }],
                ]}
                accessibilityRole="switch"
                accessibilityState={{ checked: isActive }}
              >
                <AppText
                  variant="caption"
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                  weight="600"
                >
                  {isActive ? 'Active' : 'Hidden'}
                </AppText>
              </Pressable>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.sheetFooter, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={onClose}
                fullWidth
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppButton
                title={
                  isSubmitting
                    ? isEditing
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditing
                    ? 'Update Category'
                    : 'Create Category'
                }
                variant="primary"
                size="md"
                loading={isSubmitting}
                onPress={handleFormSubmit}
                fullWidth
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    ...shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: spacing.xxs,
  },
  sheetContent: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  previewLabel: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderWidth: 2,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
  },
  colorCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  iconOption: {
    width: 68,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxs,
  },
  iconOptionLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  toggleButtonActive: {
  },
  toggleButtonInactive: {
  },
  sheetFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
