import { describe, expect, it } from 'vitest';

import {
  addUtcDays,
  computeEngagementStreakDays,
  graceUtcYmdsInInclusiveWindow,
  mergeSatisfiedUtcYmds,
  mutualPresenceUtcYmds,
  utcYmdIntersectsReunionInterval,
} from '@/features/home/homeEngagementStreak';

const HOME_TZ = 'America/Los_Angeles';

describe('addUtcDays', () => {
  it('steps across month boundary', () => {
    expect(addUtcDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addUtcDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('utcYmdIntersectsReunionInterval', () => {
  it('is false without reunion start', () => {
    expect(utcYmdIntersectsReunionInterval('2026-06-10', null, undefined, HOME_TZ)).toBe(false);
    expect(utcYmdIntersectsReunionInterval('2026-06-10', '', undefined, HOME_TZ)).toBe(false);
  });

  it('overlaps when UTC day intersects visit window', () => {
    const start = '2026-06-10T12:00:00.000Z';
    const end = '2026-06-12T23:59:59.999Z';
    expect(utcYmdIntersectsReunionInterval('2026-06-10', start, end, HOME_TZ)).toBe(true);
    expect(utcYmdIntersectsReunionInterval('2026-06-11', start, end, HOME_TZ)).toBe(true);
    expect(utcYmdIntersectsReunionInterval('2026-06-09', start, end, HOME_TZ)).toBe(false);
    expect(utcYmdIntersectsReunionInterval('2026-06-13', start, end, HOME_TZ)).toBe(false);
  });
});

describe('graceUtcYmdsInInclusiveWindow', () => {
  it('collects grace days in range', () => {
    const start = '2026-06-10T12:00:00.000Z';
    const end = '2026-06-11T23:59:59.999Z';
    const g = graceUtcYmdsInInclusiveWindow('2026-06-09', '2026-06-13', start, end, HOME_TZ);
    expect(g.has('2026-06-10')).toBe(true);
    expect(g.has('2026-06-11')).toBe(true);
    expect(g.has('2026-06-09')).toBe(false);
  });
});

describe('mutualPresenceUtcYmds', () => {
  it('requires both authors on same UTC day', () => {
    const a = 'user-a';
    const b = 'user-b';
    const rows = [
      { authorId: a, createdAt: '2026-01-05T08:00:00.000Z' },
      { authorId: b, createdAt: '2026-01-05T20:00:00.000Z' },
      { authorId: a, createdAt: '2026-01-06T10:00:00.000Z' },
    ];
    const s = mutualPresenceUtcYmds(rows, a, b);
    expect(s.has('2026-01-05')).toBe(true);
    expect(s.has('2026-01-06')).toBe(false);
  });
});

describe('mergeSatisfiedUtcYmds', () => {
  it('unions all sources', () => {
    const m = mergeSatisfiedUtcYmds({
      revealedPromptDates: ['2026-01-01'],
      mutualPresenceDates: new Set(['2026-01-02']),
      graceUtcYmds: new Set(['2026-01-03']),
    });
    expect(m.size).toBe(3);
    expect(m.has('2026-01-01') && m.has('2026-01-02') && m.has('2026-01-03')).toBe(true);
  });
});

describe('computeEngagementStreakDays', () => {
  it('counts consecutive days including anchor when satisfied', () => {
    const s = new Set(['2026-01-12', '2026-01-11', '2026-01-10']);
    expect(computeEngagementStreakDays('2026-01-12', s)).toBe(3);
  });

  it('starts from yesterday when anchor not satisfied', () => {
    const s = new Set(['2026-01-11', '2026-01-10']);
    expect(computeEngagementStreakDays('2026-01-12', s)).toBe(2);
  });

  it('returns zero when neither anchor nor yesterday satisfied', () => {
    const s = new Set(['2026-01-05']);
    expect(computeEngagementStreakDays('2026-01-12', s)).toBe(0);
  });

  it('breaks on gap', () => {
    const s = new Set(['2026-01-12', '2026-01-10']);
    expect(computeEngagementStreakDays('2026-01-12', s)).toBe(1);
  });

  it('reunion-only chain', () => {
    const s = new Set(['2026-06-10', '2026-06-11']);
    expect(computeEngagementStreakDays('2026-06-11', s)).toBe(2);
  });
});
