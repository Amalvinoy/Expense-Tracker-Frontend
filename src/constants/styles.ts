import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { typography } from './typography';

/**
 * Reusable Style Presets for core UI elements:
 * - Buttons
 * - Inputs
 * - Cards
 * - Badges
 * - Bottom Sheet
 * - Modals
 */

// 1. Button Style Presets
export const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  // Sizes
  sizeSm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  sizeMd: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
  },
  sizeLg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceVariant,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
  },
  income: {
    backgroundColor: colors.income,
  },
  disabled: {
    opacity: 0.5,
  },
});

export const buttonTextStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondary: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  outline: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ghost: {
    color: colors.primary,
    fontWeight: '600',
  },
  danger: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  income: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// 2. Input Style Presets
export const inputStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMd,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.border,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

// 3. Card Style Presets
export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.low,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  interactive: {
    ...shadows.subtle,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});

// 4. Badge Style Presets
export const badgeStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  danger: {
    backgroundColor: colors.expenseSoft,
  },
  warning: {
    backgroundColor: colors.warningSoft,
  },
  info: {
    backgroundColor: colors.infoSoft,
  },
  neutral: {
    backgroundColor: colors.surfaceVariant,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
});

export const badgeTextStyles = StyleSheet.create({
  success: {
    color: colors.success,
    ...typography.labelSm,
  },
  danger: {
    color: colors.expense,
    ...typography.labelSm,
  },
  warning: {
    color: colors.warning,
    ...typography.labelSm,
  },
  info: {
    color: colors.info,
    ...typography.labelSm,
  },
  neutral: {
    color: colors.textSecondary,
    ...typography.labelSm,
  },
  primary: {
    color: colors.primary,
    ...typography.labelSm,
  },
});

// 5. Bottom Sheet Style Presets
export const bottomSheetStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Sleek backdrop blur
    zIndex: 100,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    ...shadows.floating,
    zIndex: 101,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.headingLg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});

// 6. Modal Style Presets
export const modalStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 100,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.high,
    zIndex: 101,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingMd,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
