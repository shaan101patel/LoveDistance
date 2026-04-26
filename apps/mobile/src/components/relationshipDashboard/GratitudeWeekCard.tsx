import { Text, View } from 'react-native';

import { clamp01 } from '@/components/relationshipDashboard/clamp01';
import { Card } from '@/components/primitives';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { RelationshipDashboardSnapshot } from '@/types/domain';

const BAR_MAX = 72;

type Props = {
  block: RelationshipDashboardSnapshot['gratitude'];
};

export function GratitudeWeekCard({ block }: Props) {
  const theme = useTheme();
  const max = Math.max(1, ...block.entriesPerWeek);
  const summary = block.weekLabels
    .map((label, i) => `${label}: ${block.entriesPerWeek[i] ?? 0} little thanks`)
    .join('. ');

  return (
    <Card>
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>Small appreciations</Text>
      <Body>{block.insight}</Body>
      <Text style={{ ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.xs }}>
        Taller bars mean more tiny thank-yous that week
      </Text>
      <View
        accessibilityRole="summary"
        accessibilityLabel={`Gratitude moments by week. ${summary}`}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: spacing.sm,
          marginTop: spacing.md,
          height: BAR_MAX + spacing.lg,
        }}
      >
        {block.weekLabels.map((label, i) => {
          const count = block.entriesPerWeek[i] ?? 0;
          const h = clamp01(count / max) * BAR_MAX;
          return (
            <View key={label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <View
                style={{
                  width: '100%',
                  maxWidth: 32,
                  height: BAR_MAX,
                  borderRadius: radius.md,
                  backgroundColor: theme.colors.muted,
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: Math.max(4, h),
                    borderRadius: radius.md,
                    backgroundColor: theme.colors.primary + 'b3',
                  }}
                />
              </View>
              <Text
                numberOfLines={2}
                style={{
                  ...theme.type.caption,
                  color: theme.colors.textMuted,
                  fontSize: 10,
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
              <Text style={{ ...theme.type.caption, color: theme.colors.textSecondary, fontSize: 11 }}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
