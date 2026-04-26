import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Card } from '@/components/primitives/Card';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { MemoryItem } from '@/types/domain';

function formatLineDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StoryHighlightsBlock() {
  const theme = useTheme();
  const services = useServices();
  const { data, isSuccess } = useQuery({
    queryKey: ['timeline', 'favorites'],
    queryFn: () => services.timeline.listMemories('favorites'),
    select: (rows: MemoryItem[]) => rows.slice(0, 2),
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heading: {
          color: theme.colors.textPrimary,
          fontWeight: '600' as const,
          fontSize: 16,
          marginBottom: spacing.sm,
        },
        line: { gap: 2, marginBottom: spacing.sm },
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '500' as const },
        when: { ...theme.type.caption, color: theme.colors.textMuted },
        cta: { ...theme.type.bodySm, color: theme.colors.primary, fontWeight: '600' as const, marginTop: 4 },
      }),
    [theme],
  );

  if (!isSuccess || !data?.length) {
    return null;
  }

  return (
    <View>
      <Text style={styles.heading}>Saved moments</Text>
      <Link asChild href="/(app)/(tabs)/timeline">
        <Pressable>
          <Card elevated={false} style={{ padding: spacing.md }}>
            {data.map((m) => (
              <View key={m.id} style={styles.line}>
                <Text numberOfLines={2} style={styles.title}>
                  {m.title}
                </Text>
                <Text style={styles.when}>{formatLineDate(m.createdAt)}</Text>
              </View>
            ))}
            <Text style={styles.cta}>View timeline</Text>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
