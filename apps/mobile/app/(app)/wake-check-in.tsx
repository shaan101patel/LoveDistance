import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple, useCurrentUserId, useHabits, useToggleHabit } from '@/features/hooks';
import { findMorningRitualHabit, isMorningRitualCompleteForUser } from '@/features/rituals/morningRitual';
import { formatYmdLocal, toMonthKey } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

const SLEEP_CHIPS = ['Restful', 'OK', 'Light', 'Restless'] as const;

export default function WakeCheckInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: couple } = useCouple();
  const { meId } = useCurrentUserId();
  const monthKey = toMonthKey(new Date());
  const todayYmd = formatYmdLocal(new Date());
  const { data: habits, isLoading: habitsLoading } = useHabits(monthKey);
  const toggle = useToggleHabit(monthKey);
  const [selectedSleep, setSelectedSleep] = useState<string | null>(null);

  const alreadyDone = Boolean(meId && isMorningRitualCompleteForUser(habits, meId, todayYmd));
  const morningHabit = findMorningRitualHabit(habits);
  const partner = couple?.partner;

  const chipStyles = useMemo(
    () => ({
      row: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm, marginTop: spacing.md },
      chip: (on: boolean) => ({
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: on ? theme.colors.primary : theme.colors.border,
        backgroundColor: on ? theme.colors.primary + '1a' : theme.colors.surface,
      }),
    }),
    [theme],
  );

  if (!meId) {
    return (
      <SectionScaffold kicker="Rhythm" title="Morning check-in" lead="" scrollable>
        <Body>We need your session to save this check-in.</Body>
      </SectionScaffold>
    );
  }

  if (habitsLoading) {
    return (
      <SectionScaffold kicker="Rhythm" title="Morning check-in" lead="" scrollable>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SectionScaffold>
    );
  }

  if (alreadyDone) {
    return (
      <SectionScaffold
        kicker="Rhythm"
        title="You’re set for this morning"
        lead="You already checked in for today. The daily question is ready on Home when you are."
        scrollable
      >
        <View style={{ gap: spacing.md }}>
          <Button label="Back" onPress={() => router.back()} />
          <Text
            onPress={() => router.replace('/(app)/(tabs)/home' as Href)}
            style={{ ...typeBase.body, color: theme.colors.primary, fontWeight: '600' }}
            accessibilityRole="link"
          >
            Go to Home
          </Text>
        </View>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Rhythm"
      title="Morning check-in"
      lead={
        partner
          ? `A quick “I’m up” for you and ${partner.firstName}, even across time zones. Pick how sleep felt (optional), then save—this ties into your morning habit. No push notifications yet.`
          : 'A quick “I’m up” before your daily question opens. No push notifications yet—reminder copy only.'
      }
      scrollable
    >
      <SectionCard>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, marginBottom: spacing.xs }}>
          How did you sleep? (optional)
        </Text>
        <View style={chipStyles.row}>
          {SLEEP_CHIPS.map((label) => {
            const on = selectedSleep === label;
            return (
              <Pressable
                key={label}
                onPress={() => setSelectedSleep((s) => (s === label ? null : label))}
                style={chipStyles.chip(on)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={{ ...typeBase.bodySm, color: theme.colors.textPrimary }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <View style={{ gap: spacing.md }}>
        <Button
          label="Save and continue"
          onPress={() => {
            if (!morningHabit) return;
            toggle.mutate(
              { habitId: morningHabit.id, date: todayYmd },
              {
                onSuccess: () => router.back(),
                onError: (err) =>
                  Alert.alert(
                    "Couldn't save your check-in",
                    err instanceof Error ? err.message : 'Something went wrong.',
                  ),
              },
            );
          }}
          disabled={toggle.isPending || !morningHabit}
        />
        {!morningHabit ? (
          <Text style={{ ...typeBase.bodySm, color: theme.colors.textMuted }}>
            We couldn’t find your Morning check-in habit yet. Try Calendar — or pull to refresh Home — then
            try again.
          </Text>
        ) : null}
        {morningHabit ? (
          <Text
            onPress={() => router.push(`/(app)/habit/${morningHabit.id}` as Href)}
            style={{ ...typeBase.bodySm, color: theme.colors.primary, fontWeight: '600' }}
            accessibilityRole="link"
          >
            See morning habit in Calendar
          </Text>
        ) : null}
      </View>
    </SectionScaffold>
  );
}
