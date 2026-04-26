/**
 * Design tokens: raw palette, spacing, radius, and typography numbers.
 * Semantic light/dark colors live in `schemes.ts` + `ThemeProvider`.
 */
import type { TextStyle } from 'react-native';

export const colorPalette = {
  roseGoldHighlight: '#D89A84',
  roseGoldMid: '#C77F68',
  roseGoldShadow: '#AF6752',
  warmBackground: '#F6EFEA',
  warmBackgroundSoft: '#F3E9E3',
} as const;

/** @deprecated Use `useTheme().colors` for semantic access. Kept for gradual migration. */
export const colors = {
  ...colorPalette,
  textPrimary: '#2F1E1A',
  textSecondary: '#6E4F47',
  card: '#FFF9F6',
  border: '#E8D7CF',
  success: '#3F8A5F',
  danger: '#B64A4A',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * Base typography numbers (color comes from theme).
 * Components should merge with `useTheme().type` or these + semantic color.
 */
export const typeBase: {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  body: TextStyle;
  bodySm: TextStyle;
  caption: TextStyle;
} = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  h2: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
};
