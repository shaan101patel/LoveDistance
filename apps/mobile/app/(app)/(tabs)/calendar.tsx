import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';

import {
  HabitMonthGrid,
  HabitSelectorBar,
  HabitStreakRow,
  HabitWeekStrip,
} from '@/components/calendar';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { isUserAllowedToToggleHabit, type HabitContextIds } from '@/features/habits';
import { useCouple, useCurrentUserId, useHabits, useToggleHabit } from '@/features/hooks';
import { addLocalDays, formatYmdLocal, getMonthGridCells, getWeekYmdsForDay, toMonthKey } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function CalendarTabScreen() {
  const theme = useTheme();
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const [focusedDay, setFocusedDay] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [mode, setMode] = useState<'week' | 'month'>('month');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const { data: couple } = useCouple();
  const { meId, isSessionLoading: sessionLoading } = useCurrentUserId();
  const partnerId = couple?.partner.id;

  const monthKey = toMonthKey(visibleMonth);
  const { data: habits, isLoading } = useHabits(monthKey);
  const toggle = useToggleHabit(monthKey);

  const asOf = formatYmdLocal(today);
  const weekYmds = useMemo(() => getWeekYmdsForDay(focusedDay), [focusedDay]);
  const monthCells = useMemo(() => getMonthGridCells(visibleMonth), [visibleMonth]);

  const selectedHabit = useMemo(() => {
    if (!habits?.length) return null;
    const id = selectedHabitId && habits.some((h) => h.id === selectedHabitId) ? selectedHabitId : habits[0]!.id;
    return habits.find((h) => h.id === id) ?? null;
  }, [habits, selectedHabitId]);

  useEffect(() => {
    if (habits && habits.length > 0) {
      setSelectedHabitId((id) => (id && habits.some((h) => h.id === id) ? id : habits[0]!.id));
    }
  }, [habits]);

  const ctx: HabitContextIds | null =
    meId && partnerId ? { meId, partnerId } : null;

  const dayMeta = useCallback((ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
    const dt = new Date(y, m! - 1, d);
    return {
      dayNum: d!,
      a11yDate: dt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }, []);

  const onMonthNav = (delta: number) => {
    setVisibleMonth((v) => {
      const n = new Date(v.getFullYear(), v.getMonth() + delta, 1);
      setFocusedDay(n);
      return n;
    });
  };

  const onWeekNav = (delta: number) => {
    setFocusedDay((d) => {
      const n = addLocalDays(d, 7 * delta);
      setVisibleMonth(startOfMonth(n));
      return n;
    });
  };

  const onDayPress = (ymd: string) => {
    if (!meId || !ctx || !selectedHabit) return;
    if (!isUserAllowedToToggleHabit(selectedHabit, meId, ctx)) return;
    toggle.mutate({ habitId: selectedHabit.id, date: ymd });
  };

  const dayInteractive = (ymd: string) => {
    if (!meId || !ctx || !selectedHabit) return false;
    if (!isUserAllowedToToggleHabit(selectedHabit, meId, ctx)) return false;
    return true;
  };

  if (sessionLoading) {
    return (
      <SectionScaffold
        kicker="Rhythm"
        title="Habits"
        lead="Small rituals you keep across the distance, day by day."
        scrollable={false}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </SectionScaffold>
    );
  }

  if (!ctx) {
    return (
      <SectionScaffold
        kicker="Rhythm"
        title="Habits"
        lead="Connect with your partner to track shared habits on the calendar together."
        scrollable={false}
      >
        <Body>We need your couple profile to show your habit calendar and streaks.</Body>
      </SectionScaffold>
    );
  }

  const monthTitle = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekLabel = (() => {
    const a = weekYmds[0]!;
    const b = weekYmds[6]!;
    const [ys, m1, d1] = a.split('-').map(Number) as [number, number, number];
    const [ye, m2, d2] = b.split('-').map(Number) as [number, number, number];
    const s = new Date(ys, m1! - 1, d1);
    const e = new Date(ye, m2! - 1, d2);
    return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })();
  const toggleHint =
    selectedHabit && meId && !isUserAllowedToToggleHabit(selectedHabit, meId, ctx)
      ? selectedHabit.type === 'yours'
        ? 'Partner checks this one off in the app.'
        : "You can’t change this day (mock rules for this habit)."
      : null;

  return (
    <SectionScaffold
      kicker="Rhythm"
      title="Habits"
      lead="Small shared rituals, even in different time zones, build steady closeness. Tap a day to check in; partial days wait for your partner when both of you are meant to do it."
      scrollable={false}
    >
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} size="large" />
        ) : !habits?.length ? (
          <SectionCard>
            <Body>No habits for this month yet. When you add some, they will show up here (mock data).</Body>
          </SectionCard>
        ) : null}

        {habits && habits.length > 0 && (
          <>
            <View
              style={{
                flexDirection: 'row',
                borderRadius: radius.pill,
                backgroundColor: theme.colors.surfaceAlt,
                padding: spacing.xs,
                alignSelf: 'stretch',
              }}
            >
              {(['week', 'month'] as const).map((m) => {
                const isSel = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      if (m === 'month') {
                        setVisibleMonth(startOfMonth(focusedDay));
                      }
                      setMode(m);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderRadius: radius.pill - 2,
                        backgroundColor: isSel ? theme.colors.surface : 'transparent',
                        alignItems: 'center',
                        borderWidth: isSel ? 1 : 0,
                        borderColor: theme.colors.border,
                      },
                      pressed ? { opacity: 0.85 } : null,
                    ]}
                  >
                    <Text
                      style={{
                        ...typeBase.caption,
                        color: isSel ? theme.colors.textPrimary : theme.colors.textMuted,
                        fontWeight: isSel ? '600' : '500',
                        textTransform: 'capitalize',
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <HabitSelectorBar
              habits={habits}
              selectedId={selectedHabitId ?? habits[0]!.id}
              onSelect={setSelectedHabitId}
              asOfDate={asOf}
              anyDayInWeek={formatYmdLocal(focusedDay)}
              ctx={ctx}
            />

            {selectedHabit ? (
              <>
                <HabitStreakRow habit={selectedHabit} asOfDate={asOf} anyDayInWeek={formatYmdLocal(focusedDay)} ctx={ctx} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {mode === 'month' ? (
                    <>
                      <Pressable
                        onPress={() => onMonthNav(-1)}
                        accessibilityLabel="Previous month"
                        style={{ padding: spacing.sm }}
                      >
                        <Text style={{ ...typeBase.h2, color: theme.colors.primary }}>‹</Text>
                      </Pressable>
                      <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>{monthTitle}</Text>
                      <Pressable
                        onPress={() => onMonthNav(1)}
                        accessibilityLabel="Next month"
                        style={{ padding: spacing.sm }}
                      >
                        <Text style={{ ...typeBase.h2, color: theme.colors.primary }}>›</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable onPress={() => onWeekNav(-1)} accessibilityLabel="Previous week" style={{ padding: spacing.sm }}>
                        <Text style={{ ...typeBase.h2, color: theme.colors.primary }}>‹</Text>
                      </Pressable>
                      <Text
                        style={{
                          ...typeBase.bodySm,
                          color: theme.colors.textPrimary,
                          fontWeight: '600',
                          textAlign: 'center',
                          flex: 1,
                        }}
                      >
                        {weekLabel}
                      </Text>
                      <Pressable onPress={() => onWeekNav(1)} accessibilityLabel="Next week" style={{ padding: spacing.sm }}>
                        <Text style={{ ...typeBase.h2, color: theme.colors.primary }}>›</Text>
                      </Pressable>
                    </>
                  )}
                </View>

                {toggleHint ? <Body>{toggleHint}</Body> : null}

                {mode === 'week' ? (
                  <HabitWeekStrip
                    ymds={weekYmds}
                    habit={selectedHabit}
                    ctx={ctx}
                    onDayPress={onDayPress}
                    dayInteractive={dayInteractive}
                    dayMeta={dayMeta}
                  />
                ) : (
                  <HabitMonthGrid
                    cells={monthCells}
                    habit={selectedHabit}
                    ctx={ctx}
                    onDayPress={onDayPress}
                    dayInteractive={dayInteractive}
                    dayMeta={dayMeta}
                  />
                )}

                <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
                  <Link href={`/(app)/habit/${selectedHabit.id}`} asChild>
                    <Pressable accessibilityRole="link">
                      <Text style={{ ...typeBase.body, color: theme.colors.primary, fontWeight: '600' }}>Open habit details</Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SectionScaffold>
  );
}
