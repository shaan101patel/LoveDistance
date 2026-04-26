import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/primitives/Card';
import type { StreakPreviewModel } from '@/features/home/homeFeedComposer';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  model: StreakPreviewModel;
};

export function StreakPreviewPlaceholder({ model }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        numberRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
        number: { ...theme.type.display, color: theme.colors.textPrimary, fontSize: 40, lineHeight: 44 },
        suffix: { ...theme.type.h2, color: theme.colors.textSecondary },
        copy: { ...theme.type.bodySm, color: theme.colors.textSecondary, marginTop: spacing.sm },
        disclaimer: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.md },
      }),
    [theme],
  );

  return (
    <View accessibilityLabel="Streak preview placeholder" accessibilityRole="text">
      <Card elevated={false}>
        <View style={styles.numberRow}>
          <Text style={styles.number}>{model.currentStreakDays}</Text>
          <Text style={styles.suffix}>day streak (preview)</Text>
        </View>
        <Text style={styles.copy}>{model.copyLine}</Text>
        <Text style={styles.disclaimer}>{model.disclaimer}</Text>
      </Card>
    </View>
  );
}
