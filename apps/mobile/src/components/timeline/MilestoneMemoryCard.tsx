import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Card } from '@/components/primitives/Card';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { MemoryItem, MilestoneKind } from '@/types/domain';

const kindLabel: Record<MilestoneKind, string> = {
  anniversary: 'Anniversary',
  trip: 'Trip',
  streak_win: 'Streak',
  notable: 'Moment',
};

type Props = {
  item: MemoryItem;
};

function labelForMilestone(m: MemoryItem): string {
  if (m.type !== 'milestone') {
    return 'Milestone';
  }
  if (m.milestoneKind) {
    return kindLabel[m.milestoneKind];
  }
  return 'Milestone';
}

export function MilestoneMemoryCard({ item }: Props) {
  const theme = useTheme();
  const isTrip = item.milestoneKind === 'trip' && item.imageUri;
  const kind = labelForMilestone(item);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        col: { flex: 1, minWidth: 0, gap: 6 },
        kind: { ...theme.type.caption, color: theme.colors.textMuted, letterSpacing: 0.3 },
        title: {
          ...theme.type.body,
          color: theme.colors.textPrimary,
          fontWeight: '600' as const,
        },
        summary: { ...theme.type.bodySm, color: theme.colors.textSecondary, lineHeight: 20 },
        date: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: 2 },
        hero: {
          width: '100%' as const,
          height: 96,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
          marginBottom: spacing.sm,
        },
      }),
    [theme],
  );

  return (
    <Card elevated={false} style={{ padding: spacing.md }}>
      <View style={styles.col}>
        {isTrip ? (
          <Image contentFit="cover" source={{ uri: item.imageUri! }} style={styles.hero} transition={200} />
        ) : null}
        <Text style={styles.kind}>{kind}</Text>
        <Text numberOfLines={3} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={3} style={styles.summary}>
          {item.summary}
        </Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
    </Card>
  );
}
