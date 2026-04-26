import { describe, expect, it } from 'vitest';

import { isDateSatisfied, isUserAllowedToToggleHabit } from '@/features/habits/habitPolicy';
import type { Habit } from '@/types/domain';

const meId = 'u-me';
const partnerId = 'u-partner';
const ctx = { meId, partnerId };
const d = '2026-01-15';

function base(
  type: Habit['type'],
  policy: Habit['completionPolicy'],
  completions: Record<string, string[]> = { [d]: [meId] },
): Habit {
  return { id: 'h', title: 't', type, completionPolicy: policy, completionsByDate: completions };
}

describe('isDateSatisfied', () => {
  it('mine: satisfied if me in list', () => {
    const habit = base('mine', 'either_partner');
    expect(isDateSatisfied(habit, d, ctx)).toBe(true);
  });

  it('mine: not satisfied if me absent', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'mine',
      completionPolicy: 'either_partner',
      completionsByDate: { [d]: [partnerId] },
    };
    expect(isDateSatisfied(habit, d, ctx)).toBe(false);
  });

  it('yours: satisfied if partner in list', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'yours',
      completionPolicy: 'either_partner',
      completionsByDate: { [d]: [partnerId] },
    };
    expect(isDateSatisfied(habit, d, ctx)).toBe(true);
  });

  it('ours + either: one partner enough', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'ours',
      completionPolicy: 'either_partner',
      completionsByDate: { [d]: [meId] },
    };
    expect(isDateSatisfied(habit, d, ctx)).toBe(true);
  });

  it('ours + both: need both', () => {
    const one = base('ours', 'both_required', { [d]: [meId] });
    expect(isDateSatisfied(one, d, ctx)).toBe(false);
    const two = base('ours', 'both_required', { [d]: [meId, partnerId] });
    expect(isDateSatisfied(two, d, ctx)).toBe(true);
  });
});

describe('isUserAllowedToToggleHabit', () => {
  it('mine: me only', () => {
    const habit = base('mine', 'either_partner');
    expect(isUserAllowedToToggleHabit(habit, meId, ctx)).toBe(true);
    expect(isUserAllowedToToggleHabit(habit, partnerId, ctx)).toBe(false);
  });

  it('yours: partner only', () => {
    const habit = base('yours', 'either_partner', { [d]: [partnerId] });
    expect(isUserAllowedToToggleHabit(habit, partnerId, ctx)).toBe(true);
    expect(isUserAllowedToToggleHabit(habit, meId, ctx)).toBe(false);
  });

  it('ours: both', () => {
    const habit = base('ours', 'both_required');
    expect(isUserAllowedToToggleHabit(habit, meId, ctx)).toBe(true);
    expect(isUserAllowedToToggleHabit(habit, partnerId, ctx)).toBe(true);
  });
});
