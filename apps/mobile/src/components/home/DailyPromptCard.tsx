import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import type { HomeFeedViewModel } from '@/features/home/homeFeedComposer';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  daily: HomeFeedViewModel['daily'];
};

export function DailyPromptCard({ daily }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        kickerPill: {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        kickerText: { ...theme.type.caption, color: theme.colors.textSecondary },
        question: { ...theme.type.h1, color: theme.colors.textPrimary, marginTop: spacing.sm },
        status: { ...theme.type.bodySm, color: theme.colors.textSecondary, marginTop: spacing.md },
        doneBadge: {
          marginTop: spacing.sm,
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(63, 138, 95, 0.12)',
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        doneText: { ...theme.type.caption, color: theme.colors.success, fontWeight: '600' },
        cta: { marginTop: spacing.lg, alignSelf: 'stretch' },
      }),
    [theme],
  );

  return (
    <Card elevated>
      <View style={styles.kickerPill}>
        <Text style={styles.kickerText}>{daily.kicker} · Daily prompt</Text>
      </View>
      <Text style={styles.question}>{daily.question}</Text>
      {daily.state === 'completed' ? (
        <View style={styles.doneBadge} accessibilityLabel="Completed for today">
          <Text style={styles.doneText}>Completed for today</Text>
        </View>
      ) : null}
      <Text style={styles.status}>{daily.statusLine}</Text>
      <View style={styles.cta}>
        <Button
          label={daily.ctaLabel}
          onPress={() => router.push(`/(app)/prompt/${daily.promptId}` as Href)}
        />
      </View>
    </Card>
  );
}
