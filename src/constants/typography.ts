import { TextStyle, Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const typography: Record<string, TextStyle> = {
  // Financial Hero Numbers
  amountHero: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.8,
  },
  amountLarge: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  amountMedium: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.3,
  },
  amountSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeights.semiBold,
  },

  // Display & Headings
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.6,
  },
  headingXl: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  headingLg: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.2,
  },
  headingMd: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeights.semiBold,
  },
  headingSm: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeights.semiBold,
  },

  // Body Texts
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
  },
  bodyLgMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
  },
  bodyMdMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
  },
  bodySmMedium: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.medium,
  },

  // Labels, Badges & Captions
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.1,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.regular,
  },
};

export type TypographyVariant = keyof typeof typography;
