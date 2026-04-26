import type { Habit, HabitProgressSnapshot } from '@/types/domain';

import { isDateSatisfied, type HabitContextIds } from '@/features/habits/habitPolicy';

/** `YYYY-MM-DD` */
function addDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map((x) => Number(x));
  const t = new Date(Date.UTC(y, m - 1, d) + delta * 24 * 60 * 60 * 1000);
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mm}-${dd}`;
}

function isValidYmd(ymd: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd);
}

/**
 * Consecutive **ending** on `endDate` (inclusive) where `isDateSatisfied` is true.
 */
export function computeCurrentStreak(
  habit: Habit,
  endDate: string,
  ctx: HabitContextIds,
): number {
  if (!isValidYmd(endDate)) {
    return 0;
  }
  let n = 0;
  let d = endDate;
  while (isDateSatisfied(habit, d, ctx)) {
    n += 1;
    d = addDays(d, -1);
  }
  return n;
}

/**
 * All dates in `completionsByDate` keys, sorted, extended with any implied range; longest run of satisfied days.
 */
export function computeLongestStreak(
  habit: Habit,
  ctx: HabitContextIds,
): number {
  const keys = Object.keys(habit.completionsByDate);
  if (keys.length === 0) {
    return 0;
  }
  const sorted = [...new Set(keys)].filter(isValidYmd).sort();
  const minD = sorted[0];
  const maxD = sorted[sorted.length - 1];
  let best = 0;
  let run = 0;
  let d = minD;
  while (d <= maxD) {
    if (isDateSatisfied(habit, d, ctx)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    d = addDays(d, 1);
  }
  // Also count streaks that end after max key (only zero extension)
  return best;
}

export function buildHabitProgressSnapshot(
  habit: Habit,
  asOfDate: string,
  ctx: HabitContextIds,
): HabitProgressSnapshot {
  return {
    habit,
    currentStreak: computeCurrentStreak(habit, asOfDate, ctx),
    longestStreak: computeLongestStreak(habit, ctx),
  };
}

export { addDays };
