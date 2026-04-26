import { describe, expect, it } from 'vitest';

import { computeCurrentStreak, computeLongestStreak } from '@/features/habits/streaks';
import type { Habit } from '@/types/domain';

const meId = 'u-me';
const partnerId = 'u-partner';
const ctx = { meId, partnerId };

function oursBoth(): Habit {
  return {
    id: 'h',
    title: 't',
    type: 'ours',
    completionPolicy: 'both_required',
    completionsByDate: {
      '2026-01-10': [meId, partnerId],
      '2026-01-11': [meId, partnerId],
      '2026-01-12': [meId, partnerId],
    },
  };
}

describe('computeCurrentStreak', () => {
  it('counts consecutive days ending on endDate', () => {
    const habit = oursBoth();
    expect(computeCurrentStreak(habit, '2026-01-12', ctx)).toBe(3);
    expect(computeCurrentStreak(habit, '2026-01-11', ctx)).toBe(2);
  });

  it('stops on gap', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'ours',
      completionPolicy: 'both_required',
      completionsByDate: {
        '2026-01-10': [meId, partnerId],
        '2026-01-12': [meId, partnerId],
      },
    };
    expect(computeCurrentStreak(habit, '2026-01-12', ctx)).toBe(1);
  });
});

describe('computeLongestStreak', () => {
  it('max run in date span', () => {
    const habit: Habit = {
      id: 'h',
      title: 't',
      type: 'mine',
      completionPolicy: 'either_partner',
      completionsByDate: {
        '2026-01-01': [meId],
        '2026-01-02': [meId],
        '2026-01-04': [meId],
        '2026-01-05': [meId],
        '2026-01-06': [meId],
      },
    };
    expect(computeLongestStreak(habit, ctx)).toBe(3);
  });
});
