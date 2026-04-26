import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/primitives';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { RelationshipDashboardSnapshot } from '@/types/domain';

type Props = {
  block: RelationshipDashboardSnapshot['savedMemories'];
};

export function SavedMemoriesCard({ block }: Props) {
  const theme = useTheme();

  return (
    <Card>
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>Saved moments</Text>
      <Body>{block.insight}</Body>
      <Text
        style={{
          ...theme.type.body,
          color: theme.colors.textPrimary,
          marginTop: spacing.sm,
          fontWeight: '600',
        }}
      >
        {block.totalCount} memories tucked away in your timeline
      </Text>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {block.highlights.map((h) => (
          <Link key={h.id} href={`/(app)/memory/${h.id}` as Href} asChild>
            <Pressable
              style={({ pressed }) => ({
                paddingVertical: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ ...theme.type.body, color: theme.colors.primary, fontWeight: '600' }}>
                {h.title}
              </Text>
              <Text style={{ ...theme.type.caption, color: theme.colors.textMuted }}>{h.savedAtLabel}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Card>
  );
}
