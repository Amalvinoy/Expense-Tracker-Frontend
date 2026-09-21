import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface ExpenseSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const ExpenseSearchBar: React.FC<ExpenseSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search by note, category, or amount...',
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <AppIcon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.textPrimary }]}
        returnKeyType="search"
        clearButtonMode="never"
        selectionColor={colors.primary}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <AppIcon name="close-circle" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs + 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearButton: {
    marginLeft: spacing.xs,
    padding: spacing.xxs,
  },
});

