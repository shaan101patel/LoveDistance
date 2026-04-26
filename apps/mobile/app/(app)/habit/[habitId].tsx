import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { buildHabitProgressSnapshot } from '@/features/habits';
import { useCouple, useCurrentUserId, useHabit } from '@/features/hooks';
import { SectionCard, Body, Heading, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function HabitDetailScreen() {
  const { habitId: raw } = useLocalSearchParams<{ habitId: string }>();
  const habitId = typeof raw === 'string' ? raw : raw?.[0];
  const theme = useTheme();
  const { data: couple } = useCouple();
  const { meId } = useCurrentUserId();
  const { data: habit, isLoading, isError, isSuccess } = useHabit(habitId);

  const asOf = new Date().toISOString().slice(0, 10);
  const partnerId = couple?.partner.id;
  const progress =
    habit && meId && partnerId
      ? buildHabitProgressSnapshot(habit, asOf, { meId, partnerId })
      : null;

  if (!habitId) {
    return (
      <Screen>
        <Body>Missing habit id.</Body>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Body>Loading…</Body>
      </Screen>
    );
  }

  if (isError || (isSuccess && !habit)) {
    return (
      <Screen>
        <Body>We could not find this habit.</Body>
      </Screen>
    );
  }

  if (!habit || !progress) {
    return (
      <Screen>
        <Body>We need your couple profile to show streaks.</Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading>{habit.title}</Heading>
      <SectionCard>
        <Text style={{ color: theme.colors.textMuted, marginBottom: spacing.xs }}>{habit.id}</Text>
        <Text style={{ color: theme.colors.textPrimary, marginBottom: spacing.sm }}>
          {habit.type} · {habit.completionPolicy}
          {habit.goal
            ? ` · goal: ${habit.goal.kind === 'weekly_completions' ? `≥${habit.goal.targetCount} days/wk` : `${habit.goal.targetDays}d streak`}`
            : ''}
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          Current streak: {progress.currentStreak} · Longest: {progress.longestStreak}
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <Body>Domain model is mock-only; this screen validates types and `getHabitById`.</Body>
        </View>
      </SectionCard>
    </Screen>
  );
}
