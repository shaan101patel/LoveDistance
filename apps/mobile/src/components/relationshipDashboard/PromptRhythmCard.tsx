import { Text, View } from 'react-native';

import { clamp01 } from '@/components/relationshipDashboard/clamp01';
import { Card } from '@/components/primitives';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { RelationshipDashboardSnapshot } from '@/types/domain';

const BAR_MAX = 88;

type Props = {
  block: RelationshipDashboardSnapshot['promptRhythm'];
};

export function PromptRhythmCard({ block }: Props) {
  const theme = useTheme();
  const summary = block.weeks
    .map((w) => `${w.weekLabel}: ${Math.round(clamp01(w.bothEngagedScore) * 100)}% both showed up`)
    .join('. ');

  return (
    <Card>
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>Daily prompts</Text>
      <Body>{block.insight}</Body>
      <Text style={{ ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.xs }}>
        Last {block.weeks.length} weeks — how often you both joined in
      </Text>
      <View
        accessibilityRole="summary"
        accessibilityLabel={`Prompt rhythm over recent weeks. ${summary}`}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: spacing.xs,
          marginTop: spacing.md,
          height: BAR_MAX + spacing.lg,
        }}
      >
        {block.weeks.map((w) => {
          const h = clamp01(w.bothEngagedScore) * BAR_MAX;
          return (
            <View key={w.weekLabel} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <View
                style={{
                  width: '100%',
                  maxWidth: 28,
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
                    backgroundColor: theme.colors.primary,
                  }}
                />
              </View>
              <Text
                numberOfLines={1}
                style={{ ...theme.type.caption, color: theme.colors.textMuted, fontSize: 10 }}
              >
                {w.weekLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
