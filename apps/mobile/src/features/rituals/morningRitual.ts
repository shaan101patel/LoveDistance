import type { Habit } from '@/types/domain';

/** Mock seed: shared morning wake check-in (both) — used to gate the daily prompt until the user’s side is checked off for the day. */
export const WAKE_HABIT_ID = 'habit-ours-both' as const;

export function isMorningRitualCompleteForUser(
  habits: Habit[] | undefined,
  meId: string,
  todayYmd: string,
): boolean {
  if (!habits?.length) {
    return false;
  }
  const h = habits.find((x) => x.id === WAKE_HABIT_ID);
  if (!h) {
    return false;
  }
  return (h.completionsByDate[todayYmd] ?? []).includes(meId);
}
