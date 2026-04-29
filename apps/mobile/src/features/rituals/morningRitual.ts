import type { Habit } from '@/types/domain';

/** Matches Supabase-seeded default habit title (`seed_default_habits_for_couple`). */
export const MORNING_RITUAL_HABIT_TITLE = 'Morning check-in' as const;

function normalizeHabitTitle(title: string): string {
  return title.trim().toLowerCase();
}

/**
 * Resolves the morning check-in habit from the month list. Uses title so mock ids and
 * Supabase UUIDs both work.
 */
export function findMorningRitualHabit(habits: Habit[] | undefined): Habit | undefined {
  if (!habits?.length) {
    return undefined;
  }
  const want = normalizeHabitTitle(MORNING_RITUAL_HABIT_TITLE);
  return habits.find((h) => normalizeHabitTitle(h.title) === want);
}

export function isMorningRitualCompleteForUser(
  habits: Habit[] | undefined,
  meId: string,
  todayYmd: string,
): boolean {
  const h = findMorningRitualHabit(habits);
  if (!h) {
    return false;
  }
  return (h.completionsByDate[todayYmd] ?? []).includes(meId);
}
