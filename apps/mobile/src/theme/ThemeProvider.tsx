import { type PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import type { AppTheme } from '@/theme/types';
import { buildDarkTheme, buildLightTheme } from '@/theme/schemes';

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => {
    return colorScheme === 'dark' ? buildDarkTheme() : buildLightTheme();
  }, [colorScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
