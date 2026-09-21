import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { ExpenseCategory } from '@/types/expense.types';

export type CategoryIconSize = 'sm' | 'md' | 'lg';

export interface CategoryIconProps {
  category: ExpenseCategory | string;
  size?: CategoryIconSize;
  showLabel?: boolean;
  style?: ViewStyle;
  iconName?: string;
  color?: string;
  backgroundColor?: string;
}

const sizeConfig: Record<CategoryIconSize, { containerSize: number; iconSize: number }> = {
  sm: { containerSize: 32, iconSize: 16 },
  md: { containerSize: 42, iconSize: 22 },
  lg: { containerSize: 52, iconSize: 28 },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  showLabel = false,
  style,
  iconName,
  color,
  backgroundColor,
}) => {
  const { colors } = useAppTheme();

  const getCategoryConfig = (catName: string) => {
    const key = catName.toLowerCase().replace(/[^a-z]/g, '');
    let catColors = colors.categories.other;
    let defaultIcon = 'dots-horizontal-circle-outline';

    if (key.includes('food') || key.includes('dining')) {
      catColors = colors.categories.food;
      defaultIcon = 'silverware-fork-knife';
    } else if (key.includes('transport')) {
      catColors = colors.categories.transportation;
      defaultIcon = 'car-outline';
    } else if (key.includes('housing') || key.includes('rent') || key.includes('utilities')) {
      catColors = colors.categories.housing;
      defaultIcon = 'home-outline';
    } else if (key.includes('shopping')) {
      catColors = colors.categories.shopping;
      defaultIcon = 'shopping-outline';
    } else if (key.includes('entertain')) {
      catColors = colors.categories.entertainment;
      defaultIcon = 'movie-outline';
    } else if (key.includes('health')) {
      catColors = colors.categories.healthcare;
      defaultIcon = 'heart-pulse';
    } else if (key.includes('educat')) {
      catColors = colors.categories.education;
      defaultIcon = 'school-outline';
    } else if (key.includes('personal') || key.includes('care')) {
      catColors = colors.categories.personalCare;
      defaultIcon = 'spa-outline';
    } else if (key.includes('travel')) {
      catColors = colors.categories.travel;
      defaultIcon = 'airplane';
    } else if (key.includes('invest')) {
      catColors = colors.categories.investments;
      defaultIcon = 'chart-line';
    } else if (key.includes('salary')) {
      catColors = colors.categories.salary;
      defaultIcon = 'cash-multiple';
    }

    return {
      iconName: defaultIcon,
      color: catColors?.color || colors.primary,
      bg: catColors?.bg || colors.primarySoft,
    };
  };

  const config = getCategoryConfig(String(category));
  const { containerSize, iconSize } = sizeConfig[size];

  const resolvedIcon = iconName || config.iconName;
  const resolvedColor = color || config.color;
  const resolvedBg = backgroundColor || config.bg;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: radius.md,
            backgroundColor: resolvedBg,
          },
        ]}
      >
        <AppIcon
          name={resolvedIcon}
          size={iconSize}
          color={resolvedColor}
          family="material"
        />
      </View>
      {showLabel && (
        <AppText variant="bodySmMedium" color={colors.textSecondary} style={styles.label}>
          {category}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
