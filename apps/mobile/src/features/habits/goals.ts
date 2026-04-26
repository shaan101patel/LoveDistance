import type { Habit, HabitGoal } from '@/types/domain';

import { isDateSatisfied, type HabitContextIds } from '@/features/habits/habitPolicy';
import { addDays, computeCurrentStreak } from '@/features/habits/streaks';

function parseYmd(ymd: string): { y: number; m: number; d: number } {
  const [y, m, d] = ymd.split('-').map((x) => Number(x));
  return { y, m, d: d! };
}

/** Monday (UTC) of the week that contains `anyDayInWeek`. */
function mondayOfWeekContaining(anyDayInWeek: string): string {
  const { y, m, d } = parseYmd(anyDayInWeek);
  const t = new Date(Date.UTC(y, m - 1, d));
  const dow = t.getUTCDay();
  const daysFromMon = (dow + 6) % 7;
  const t0 = new Date(t.getTime() - daysFromMon * 24 * 60 * 60 * 1000);
  const mm = String(t0.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t0.getUTCDate()).padStart(2, '0');
  return `${t0.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * `weekly_completions` goal: how many days this ISO week (Mon–Sun UTC) are satisfied, vs `targetCount`.
 */
export function weekSatisfactionForGoal(
  habit: Habit,
  anyDayInWeek: string,
  ctx: HabitContextIds,
): { satisfiedDays: number; targetCount: number } | null {
  if (habit.goal?.kind !== 'weekly_completions') {
    return null;
  }
  const start = mondayOfWeekContaining(anyDayInWeek);
  let c = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = i === 0 ? start : addDays(start, i);
    if (isDateSatisfied(habit, d, ctx)) {
      c += 1;
    }
  }
  return { satisfiedDays: c, targetCount: habit.goal.targetCount };
}

export function streakTargetProgress(
  habit: Habit,
  asOfDate: string,
  goal: HabitGoal & { kind: 'streak_target' },
  ctx: HabitContextIds,
): { current: number; target: number; met: boolean } {
  const current = computeCurrentStreak(habit, asOfDate, ctx);
  return {
    current,
    target: goal.targetDays,
    met: current >= goal.targetDays,
  };
}
