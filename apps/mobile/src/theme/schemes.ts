import type { AppTheme, SemanticColors, ThemeShadows, TypeScale } from '@/theme/types';
import { colorPalette, typeBase } from '@/theme/tokens';

function withColor(text: TypeScale, color: string): TypeScale {
  return {
    display: { ...text.display, color },
    h1: { ...text.h1, color },
    h2: { ...text.h2, color },
    body: { ...text.body, color },
    bodySm: { ...text.bodySm, color },
    caption: { ...text.caption, color },
  };
}

const lightColors: SemanticColors = {
  bg: colorPalette.warmBackground,
  surface: '#FFF9F6',
  surfaceAlt: colorPalette.warmBackgroundSoft,
  textPrimary: '#2F1E1A',
  textSecondary: '#6E4F47',
  textMuted: '#8A7269',
  border: '#E8D7CF',
  primary: colorPalette.roseGoldMid,
  primaryPressed: colorPalette.roseGoldShadow,
  onPrimary: '#FFFFFF',
  muted: 'rgba(47, 30, 26, 0.45)',
  danger: '#B64A4A',
  success: '#3F8A5F',
  navBarBg: '#FFF9F6',
  navBarBorder: '#E8D7CF',
  tabActive: colorPalette.roseGoldShadow,
  tabInactive: '#8A7269',
};

const darkColors: SemanticColors = {
  bg: '#1C1412',
  surface: '#252019',
  surfaceAlt: '#2E2825',
  textPrimary: '#F6EFEA',
  textSecondary: '#D4C4BC',
  textMuted: '#9A8A82',
  border: 'rgba(216, 154, 132, 0.22)',
  primary: colorPalette.roseGoldHighlight,
  primaryPressed: colorPalette.roseGoldMid,
  onPrimary: '#1C1412',
  muted: 'rgba(246, 239, 234, 0.5)',
  danger: '#E07A7A',
  success: '#5CB88A',
  navBarBg: '#252019',
  navBarBorder: 'rgba(216, 154, 132, 0.18)',
  tabActive: colorPalette.roseGoldHighlight,
  tabInactive: '#9A8A82',
};

function lightShadows(): ThemeShadows {
  return {
    topBar: {
      shadowColor: '#2F1E1A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#2F1E1A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    button: {
      shadowColor: colorPalette.roseGoldShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 2,
    },
    bar: {
      shadowColor: '#2F1E1A',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
  };
}

function darkShadows(): ThemeShadows {
  return {
    topBar: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 4,
    },
    button: {
      shadowColor: colorPalette.roseGoldHighlight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    bar: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
  };
}

export function buildLightTheme(): AppTheme {
  return {
    scheme: 'light',
    colors: lightColors,
    shadows: lightShadows(),
    type: withColor(typeBase, lightColors.textPrimary),
  };
}

export function buildDarkTheme(): AppTheme {
  return {
    scheme: 'dark',
    colors: darkColors,
    shadows: darkShadows(),
    type: withColor(typeBase, darkColors.textPrimary),
  };
}
