import type { Habit } from '@/types/domain';

import { isDateSatisfied, type HabitContextIds } from '@/features/habits/habitPolicy';

/**
 * Visual completion for a day cell (not the same as domain “satisfied” for streaks
 * on `ours`+`both`: we also surface “waiting for partner”.)
 */
export type HabitDayDisplayState = 'empty' | 'partial' | 'satisfied';

export function getHabitDayDisplayState(
  habit: Habit,
  date: string,
  ctx: HabitContextIds,
): HabitDayDisplayState {
  if (isDateSatisfied(habit, date, ctx)) {
    return 'satisfied';
  }
  if (habit.type === 'ours' && habit.completionPolicy === 'both_required') {
    const raw = habit.completionsByDate[date] ?? [];
    const { meId, partnerId } = ctx;
    const hasMe = raw.includes(meId);
    const hasPartner = raw.includes(partnerId);
    if ((hasMe && !hasPartner) || (!hasMe && hasPartner)) {
      return 'partial';
    }
  }
  return 'empty';
}
