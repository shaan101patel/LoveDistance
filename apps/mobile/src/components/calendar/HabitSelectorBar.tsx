import { useMemo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import type { Habit } from '@/types/domain';
import { buildHabitProgressSnapshot, weekSatisfactionForGoal } from '@/features/habits';
import type { HabitContextIds } from '@/features/habits/habitPolicy';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

function typeLine(h: Habit): string {
  if (h.type === 'mine') return 'Mine';
  if (h.type === 'yours') return "Partner's";
  return 'Ours';
}

type Props = {
  habits: Habit[];
  selectedId: string;
  onSelect: (id: string) => void;
  asOfDate: string;
  anyDayInWeek: string;
  ctx: HabitContextIds;
};

export function HabitSelectorBar({
  habits,
  selectedId,
  onSelect,
  asOfDate,
  anyDayInWeek,
  ctx,
}: Props) {
  const theme = useTheme();

  const lines = useMemo(() => {
    const out = new Map<string, string>();
    for (const h of habits) {
      const snap = buildHabitProgressSnapshot(h, asOfDate, ctx);
      const w = weekSatisfactionForGoal(h, anyDayInWeek, ctx);
      out.set(
        h.id,
        w != null
          ? `${w.satisfiedDays}/${w.targetCount} this week · ${snap.currentStreak} streak`
          : `Streak ${snap.currentStreak}`,
      );
    }
    return out;
  }, [asOfDate, anyDayInWeek, ctx, habits]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: 2 }}>
      {habits.map((h) => {
        const sub = lines.get(h.id);
        const isSel = h.id === selectedId;
        return (
          <Pressable
            key={h.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSel }}
            onPress={() => onSelect(h.id)}
            style={({ pressed }) => [
              {
                minWidth: 160,
                maxWidth: 220,
                padding: spacing.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: isSel ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSel ? theme.colors.primary + '14' : theme.colors.surface,
              },
              pressed ? { opacity: 0.9 } : null,
            ]}
          >
            <Text
              numberOfLines={2}
              style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}
            >
              {h.title}
            </Text>
            <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, marginTop: 4 }}>
              {typeLine(h)} · {h.completionPolicy === 'both_required' ? 'both' : 'either'}
            </Text>
            {sub ? (
              <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary, marginTop: 6 }} numberOfLines={2}>
                {sub}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
