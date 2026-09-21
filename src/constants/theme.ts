import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { lightColors, darkColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.income,
    tertiary: lightColors.investment,
    error: lightColors.expense,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    outline: lightColors.border,
    onSurface: lightColors.textPrimary,
    onBackground: lightColors.textPrimary,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.income,
    tertiary: darkColors.investment,
    error: darkColors.expense,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    outline: darkColors.border,
    onSurface: darkColors.textPrimary,
    onBackground: darkColors.textPrimary,
  },
};

export interface AppThemeObject {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
}

export const theme = {
  colors: lightColors,
  typography,
  spacing,
  radius,
  shadows,
  lightTheme,
  darkTheme,
} as const;

export type AppTheme = typeof theme;
