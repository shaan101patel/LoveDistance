import { describe, expect, it } from 'vitest';

import { isMorningRitualCompleteForUser, WAKE_HABIT_ID } from '@/features/rituals/morningRitual';
import type { Habit } from '@/types/domain';

const me = 'u-me';
const d = '2026-01-15';

function wakeHabit(completions: Record<string, string[]>): Habit {
  return {
    id: WAKE_HABIT_ID,
    title: 'Morning',
    type: 'ours',
    completionPolicy: 'both_required',
    completionsByDate: completions,
  };
}

describe('isMorningRitualCompleteForUser', () => {
  it('false when habits empty or habit missing', () => {
    expect(isMorningRitualCompleteForUser(undefined, me, d)).toBe(false);
    expect(isMorningRitualCompleteForUser([wakeHabit({})], me, d)).toBe(false);
  });

  it('true when meId is in that date list for wake habit', () => {
    expect(
      isMorningRitualCompleteForUser(
        [wakeHabit({ [d]: [me, 'p'] }), { id: 'x', title: 'x', type: 'mine', completionPolicy: 'either_partner', completionsByDate: {} }],
        me,
        d,
      ),
    ).toBe(true);
  });
});
