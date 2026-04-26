import { Text, View } from 'react-native';

import type { Habit } from '@/types/domain';
import { buildHabitProgressSnapshot, streakTargetProgress, weekSatisfactionForGoal } from '@/features/habits';
import type { HabitContextIds } from '@/features/habits/habitPolicy';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  habit: Habit;
  asOfDate: string;
  anyDayInWeek: string;
  ctx: HabitContextIds;
};

export function HabitStreakRow({ habit, asOfDate, anyDayInWeek, ctx }: Props) {
  const theme = useTheme();
  const snap = buildHabitProgressSnapshot(habit, asOfDate, ctx);
  const week = weekSatisfactionForGoal(habit, anyDayInWeek, ctx);
  const streakGoal =
    habit.goal?.kind === 'streak_target' ? streakTargetProgress(habit, asOfDate, habit.goal, ctx) : null;

  return (
    <View
      style={{
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: spacing.md,
        gap: spacing.xs,
      }}
    >
      <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>
        Streaks & goals
      </Text>
      <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
        Current streak: {snap.currentStreak} · Longest: {snap.longestStreak}
      </Text>
      {week ? (
        <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
          {week.satisfiedDays} / {week.targetCount} days this week
        </Text>
      ) : null}
      {streakGoal ? (
        <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
          Streak goal: {streakGoal.current} / {streakGoal.target} days{streakGoal.met ? ' · met' : ''}
        </Text>
      ) : null}
    </View>
  );
}
