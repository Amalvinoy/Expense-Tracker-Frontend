/**
 * Border radius system for cards, buttons, inputs, chips, and modals
 */
export const radius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 32,
  full: 9999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof typeof radius;
