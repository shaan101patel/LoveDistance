import { describe, expect, it } from 'vitest';

import { getHabitDayDisplayState } from '@/features/habits/habitDisplayState';
import type { Habit } from '@/types/domain';

const meId = 'u-me';
const partnerId = 'u-partner';
const ctx = { meId, partnerId };
const d = '2026-01-15';

function base(
  type: Habit['type'],
  policy: Habit['completionPolicy'],
  completions: Record<string, string[]>,
): Habit {
  return { id: 'h', title: 't', type, completionPolicy: policy, completionsByDate: completions };
}

describe('getHabitDayDisplayState', () => {
  it('satisfied: ours+both with both in list', () => {
    const habit = base('ours', 'both_required', { [d]: [meId, partnerId] });
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('satisfied');
  });

  it('partial: ours+both with only me', () => {
    const habit = base('ours', 'both_required', { [d]: [meId] });
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('partial');
  });

  it('partial: ours+both with only partner', () => {
    const habit = base('ours', 'both_required', { [d]: [partnerId] });
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('partial');
  });

  it('empty: ours+both with neither', () => {
    const habit = base('ours', 'both_required', { [d]: [] });
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('empty');
  });

  it('satisfied: ours+either with one in list (no partial for either)', () => {
    const habit = base('ours', 'either_partner', { [d]: [meId] });
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('satisfied');
  });

  it('empty: mine with no me', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'mine',
      completionPolicy: 'either_partner',
      completionsByDate: { [d]: [partnerId] },
    };
    expect(getHabitDayDisplayState(habit, d, ctx)).toBe('empty');
  });
});
