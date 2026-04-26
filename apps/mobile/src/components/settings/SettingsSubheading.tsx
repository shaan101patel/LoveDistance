import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = { children: string };

export function SettingsSubheading({ children }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sub: {
          ...theme.type.caption,
          color: theme.colors.textSecondary,
          fontWeight: '600',
          textTransform: 'uppercase' as const,
          letterSpacing: 0.4,
          marginBottom: spacing.sm,
        },
      }),
    [theme],
  );
  return <Text style={styles.sub}>{children}</Text>;
}
