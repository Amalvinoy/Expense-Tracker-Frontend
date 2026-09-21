import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { TypographyVariant } from '@/constants/typography';
import { formatCurrency } from '@/utils/formatters';

export type AmountType = 'income' | 'expense' | 'neutral' | 'auto';

export interface AmountTextProps {
  amount: number;
  currency?: string;
  type?: AmountType;
  variant?: TypographyVariant;
  showSign?: boolean;
  color?: string;
  style?: ViewStyle | TextStyle;
}

export const AmountText: React.FC<AmountTextProps> = ({
  amount,
  currency,
  type = 'auto',
  variant = 'amountMedium',
  showSign = true,
  color,
  style,
}) => {
  const { colors } = useAppTheme();

  // Determine resolved financial type
  let resolvedType: 'income' | 'expense' | 'neutral' = 'neutral';
  if (type === 'auto') {
    if (amount > 0) resolvedType = 'income';
    else if (amount < 0) resolvedType = 'expense';
    else resolvedType = 'neutral';
  } else {
    resolvedType = type;
  }

  // Determine color
  let resolvedColor: string = colors.textPrimary;
  if (color) {
    resolvedColor = color;
  } else if (resolvedType === 'income') {
    resolvedColor = colors.income;
  } else if (resolvedType === 'expense') {
    resolvedColor = colors.expense;
  }

  // Determine prefix sign
  const absoluteAmount = Math.abs(amount);
  const formattedNumber = formatCurrency(absoluteAmount, currency);

  let prefix = '';
  if (showSign) {
    if (resolvedType === 'income') prefix = '+';
    else if (resolvedType === 'expense') prefix = '-';
  }

  return (
    <AppText
      variant={variant}
      color={resolvedColor}
      tabularNums
      style={style as TextStyle}
    >
      {prefix}{formattedNumber}
    </AppText>
  );
};
