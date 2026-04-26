import { Text, View } from 'react-native';

import { clamp01 } from '@/components/relationshipDashboard/clamp01';
import { Card } from '@/components/primitives';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { RelationshipDashboardSnapshot } from '@/types/domain';

type Props = {
  block: RelationshipDashboardSnapshot['favoriteCategories'];
};

export function FavoriteCategoriesCard({ block }: Props) {
  const theme = useTheme();
  const summary = block.items
    .map((it) => `${it.label}: ${Math.round(clamp01(it.share) * 100)} percent`)
    .join('. ');

  return (
    <Card>
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>Themes you return to</Text>
      <Body>{block.insight}</Body>
      <View
        accessibilityRole="summary"
        accessibilityLabel={`Favorite conversation themes. ${summary}`}
        style={{ gap: spacing.md, marginTop: spacing.md }}
      >
        {block.items.map((item) => (
          <View key={item.label} style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...theme.type.body, color: theme.colors.textPrimary, flex: 1 }}>{item.label}</Text>
              <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted }}>
                {Math.round(clamp01(item.share) * 100)}%
              </Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: radius.pill,
                backgroundColor: theme.colors.muted,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.round(clamp01(item.share) * 100)}%`,
                  height: '100%',
                  borderRadius: radius.pill,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
