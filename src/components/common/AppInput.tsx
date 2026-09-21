import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { inputStyles } from '@/constants/styles';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  disabled = false,
  containerStyle,
  inputStyle,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const isSecured = isPassword ? !showPassword : secureTextEntry;

  const dynamicWrapperStyle: ViewStyle = {
    backgroundColor: disabled
      ? colors.surfaceVariant
      : hasError
      ? colors.dangerSoft
      : isFocused
      ? colors.surface
      : colors.inputBackground,
    borderColor: hasError
      ? colors.danger
      : isFocused
      ? colors.primary
      : colors.inputBorder,
  };

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && (
        <AppText
          variant="labelMd"
          color={colors.textPrimary}
          style={{ marginBottom: spacing.xs + 2 }}
        >
          {label}
        </AppText>
      )}

      <View
        style={[
          inputStyles.inputWrapper,
          dynamicWrapperStyle,
          disabled && { opacity: 0.7 },
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            inputStyles.textInput,
            { color: colors.textPrimary, ...typography.bodyMd },
            inputStyle,
          ]}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          secureTextEntry={isSecured}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.rightActionContainer}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <AppIcon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : (
          rightIcon && <View style={styles.rightActionContainer}>{rightIcon}</View>
        )}
      </View>

      {hasError ? (
        <AppText variant="caption" color={colors.danger} style={{ marginTop: spacing.xs, fontWeight: '500' }}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIconContainer: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionContainer: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
