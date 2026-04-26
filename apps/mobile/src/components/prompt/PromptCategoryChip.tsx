import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = { label: string };

export function PromptCategoryChip({ label }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        text: { ...theme.type.caption, color: theme.colors.textSecondary, fontWeight: '600' as const },
      }),
    [theme],
  );
  return (
    <View style={styles.wrap} accessibilityLabel={`Category: ${label}`}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
