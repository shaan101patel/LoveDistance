import { type PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
  elevated?: boolean;
}>;

export function Card({ children, style, elevated = true }: CardProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: spacing.lg,
          gap: spacing.sm,
        },
      }),
    [theme],
  );

  return <View style={[styles.card, elevated && theme.shadows.card, style]}>{children}</View>;
}
