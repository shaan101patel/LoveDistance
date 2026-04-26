import type { TextStyle, ViewStyle } from 'react-native';

/** Raw brand palette (single source for both modes). */
export type ColorPalette = {
  roseGoldHighlight: string;
  roseGoldMid: string;
  roseGoldShadow: string;
  warmBackground: string;
  warmBackgroundSoft: string;
};

/** Semantic colors used by UI components. */
export type SemanticColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  muted: string;
  danger: string;
  success: string;
  /** Tab / nav chrome */
  navBarBg: string;
  navBarBorder: string;
  tabActive: string;
  tabInactive: string;
};

export type ThemeShadows = {
  card: ViewStyle;
  button: ViewStyle;
  topBar: ViewStyle;
  bar: ViewStyle;
};

export type TypeScale = {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  body: TextStyle;
  bodySm: TextStyle;
  caption: TextStyle;
};

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: SemanticColors;
  shadows: ThemeShadows;
  type: TypeScale;
};
