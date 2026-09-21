import React from 'react';
import { Pressable, View, ViewStyle, GestureResponderEvent, StyleProp } from 'react-native';
import { cardStyles } from '@/constants/styles';
import { spacing, SpacingKey } from '@/constants/spacing';
import { useAppTheme } from '@/hooks';

export type CardVariant = 'elevated' | 'outlined' | 'flat';

export interface AppCardProps {
  variant?: CardVariant;
  padding?: SpacingKey | number;
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'elevated',
  padding = 'lg',
  onPress,
  children,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const baseCardStyle = cardStyles[variant] || cardStyles.elevated;
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding] ?? spacing.lg;

  const dynamicCardStyle: ViewStyle = {
    backgroundColor: variant === 'flat' ? colors.surfaceVariant : colors.surface,
    borderColor: variant === 'outlined' ? colors.border : isDark ? colors.border : undefined,
    borderWidth: variant === 'outlined' ? 1 : isDark ? 1 : 0,
  };

  const combinedStyle: ViewStyle = {
    ...baseCardStyle,
    ...dynamicCardStyle,
    padding: paddingValue,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          combinedStyle,
          cardStyles.interactive,
          pressed && cardStyles.pressed,
          style,
        ]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[combinedStyle, style]}>{children}</View>;
};
