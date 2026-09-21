import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { AppText } from './AppText';
import { buttonStyles } from '@/constants/styles';
import { spacing } from '@/constants/spacing';
import { useAppTheme } from '@/hooks';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'income';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors } = useAppTheme();

  const sizeStyle =
    size === 'sm'
      ? buttonStyles.sizeSm
      : size === 'lg'
      ? buttonStyles.sizeLg
      : buttonStyles.sizeMd;

  const isDisabled = disabled || loading;

  const getDynamicVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.surfaceVariant };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'danger':
        return { backgroundColor: colors.danger };
      case 'income':
        return { backgroundColor: colors.income };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getDynamicTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'income':
        return colors.textInverse;
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.textPrimary;
      case 'ghost':
        return colors.primary;
      default:
        return colors.textInverse;
    }
  };

  const spinnerColor =
    variant === 'outline' || variant === 'secondary' || variant === 'ghost'
      ? colors.primary
      : colors.textInverse;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        buttonStyles.base,
        sizeStyle,
        getDynamicVariantStyle(),
        fullWidth && { width: '100%' },
        isDisabled && buttonStyles.disabled,
        pressed && !isDisabled && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <AppText
            variant={size === 'sm' ? 'labelSm' : size === 'lg' ? 'labelLg' : 'labelMd'}
            color={getDynamicTextColor()}
            style={[
              leftIcon ? { marginLeft: spacing.xs + 2 } : undefined,
              rightIcon ? { marginRight: spacing.xs + 2 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </AppText>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
};
