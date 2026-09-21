import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography, TypographyVariant } from '@/constants/typography';
import { useAppTheme } from '@/hooks';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  weight?: '400' | '500' | '600' | '700' | '800';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  tabularNums?: boolean;
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMd',
  color,
  weight,
  align,
  tabularNums = false,
  style,
  children,
  ...rest
}) => {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.textPrimary;
  const baseStyle = typography[variant] || typography.bodyMd;

  const customStyle: TextStyle = {
    color: resolvedColor,
    ...(weight ? { fontWeight: weight } : {}),
    ...(align ? { textAlign: align } : {}),
    ...(tabularNums ? { fontVariant: ['tabular-nums'] } : {}),
  };

  return (
    <Text style={[baseStyle, customStyle, style]} {...rest}>
      {children}
    </Text>
  );
};
