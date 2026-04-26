import type { Habit } from '@/types/domain';

export type HabitContextIds = { meId: string; partnerId: string };

/**
 * Completions in `completionsByDate[date]` are only meaningful for the habit type:
 * - `mine`: only `meId` may appear.
 * - `yours`: only `partnerId` may appear.
 * - `ours`: both may appear; `completionPolicy` defines whether one or two satisfy the day.
 */
export function isDateSatisfied(
  habit: Habit,
  date: string,
  ctx: HabitContextIds,
): boolean {
  const raw = habit.completionsByDate[date] ?? [];
  const { meId, partnerId } = ctx;
  if (habit.type === 'mine') {
    return raw.includes(meId);
  }
  if (habit.type === 'yours') {
    return raw.includes(partnerId);
  }
  // ours
  const hasMe = raw.includes(meId);
  const hasPartner = raw.includes(partnerId);
  if (habit.completionPolicy === 'both_required') {
    return hasMe && hasPartner;
  }
  return hasMe || hasPartner;
}

/**
 * Toggles for mock/API should only add/remove allowed user ids.
 */
export function isUserAllowedToToggleHabit(
  habit: Habit,
  userId: string,
  ctx: HabitContextIds,
): boolean {
  if (habit.type === 'mine') {
    return userId === ctx.meId;
  }
  if (habit.type === 'yours') {
    return userId === ctx.partnerId;
  }
  return userId === ctx.meId || userId === ctx.partnerId;
}
