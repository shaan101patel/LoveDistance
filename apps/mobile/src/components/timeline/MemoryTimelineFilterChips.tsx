import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { TimelineMemoryFilter } from '@/types/domain';

const options: { value: TimelineMemoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'photo', label: 'Photo' },
  { value: 'gratitude', label: 'Gratitude' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'favorites', label: 'Favorites' },
];

type Props = {
  value: TimelineMemoryFilter;
  onChange: (next: TimelineMemoryFilter) => void;
};

export function MemoryTimelineFilterChips({ value, onChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flexGrow: 0 },
        row: { flexDirection: 'row' as const, gap: spacing.sm, paddingVertical: 2 },
        chip: {
          borderRadius: radius.pill,
          borderWidth: 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        label: { ...theme.type.caption, fontWeight: '600' as const },
      }),
    [theme],
  );

  return (
    <ScrollView
      horizontal
      accessibilityRole="list"
      contentContainerStyle={styles.row}
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityLabel={`Filter: ${opt.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.surfaceAlt : theme.colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
