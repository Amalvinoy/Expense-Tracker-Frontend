import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { lightColors, darkColors, ThemeColors } from '@/constants/colors';
import { lightTheme, darkTheme, AppThemeObject } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { shadows } from '@/constants/shadows';
import { ThemePreference } from '@/features/settings/types/settings.types';

export interface UseAppThemeReturn {
  isDark: boolean;
  themePreference: ThemePreference;
  colors: ThemeColors;
  theme: AppThemeObject;
  paperTheme: typeof lightTheme;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

/**
 * Universal Theme Hook for Expense Tracker.
 * Dynamically resolves active color tokens based on user preference and system dark mode.
 */
export function useAppTheme(): UseAppThemeReturn {
  const systemColorScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.settings.theme);
  const setThemePreference = useSettingsStore((s) => s.setTheme);

  const isDark =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';

  const colors: ThemeColors = isDark ? darkColors : lightColors;
  const paperTheme = isDark ? darkTheme : lightTheme;

  const theme: AppThemeObject = {
    colors,
    typography,
    spacing,
    radius,
    shadows,
    isDark,
  };

  return {
    isDark,
    themePreference,
    colors,
    theme,
    paperTheme,
    setTheme: setThemePreference,
  };
}
