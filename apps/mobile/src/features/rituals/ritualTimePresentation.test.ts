import { describe, expect, it } from 'vitest';

import {
  MOCK_PARTNER_TIME_ZONE,
  calendarDateForReunionPicker,
  deviceTimeZone,
  effectiveReunionEndIso,
  localCalendarDateFromReunionIso,
  localYmdIntersectsReunionVisit,
  partnerRelativeDaypart,
  reunionCountdownParts,
  reunionEndOfLocalDayIso,
  reunionEndOfDayIsoFromYmdInZone,
  reunionIsoFromLocalDate,
  reunionIsoFromYmdInZone,
  reunionVisitPhase,
  visitCalendarDaysRemaining,
  ymdInZoneFromIso,
} from '@/features/rituals/ritualTimePresentation';
describe('reunionCountdownParts', () => {
  const now = new Date('2026-04-01T12:00:00.000Z');

  it('counts down days and hours before reunion', () => {
    const reunion = '2026-04-10T12:00:00.000Z';
    const p = reunionCountdownParts(reunion, now);
    expect(p.isPast).toBe(false);
    expect(p.days).toBe(9);
    expect(p.hours).toBe(0);
  });

  it('marks past when reunion is before now', () => {
    const reunion = '2026-03-01T12:00:00.000Z';
    const p = reunionCountdownParts(reunion, now);
    expect(p.isPast).toBe(true);
    expect(p.days).toBe(0);
    expect(p.hours).toBe(0);
  });
});

describe('partnerRelativeDaypart', () => {
  it('returns a stable bucket string for a fixed instant in London', () => {
    const noonUtc = new Date('2026-06-15T12:00:00.000Z');
    const label = partnerRelativeDaypart(noonUtc, MOCK_PARTNER_TIME_ZONE);
    expect(['morning there', 'afternoon there', 'evening there', 'late night there']).toContain(label);
  });
});

describe('reunionIsoFromLocalDate / localCalendarDateFromReunionIso', () => {
  it('round-trips local calendar day at midday', () => {
    const d = new Date(2026, 5, 10, 9, 30, 0, 0);
    const iso = reunionIsoFromLocalDate(d);
    const back = localCalendarDateFromReunionIso(iso);
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(5);
    expect(back.getDate()).toBe(10);
  });
});

describe('reunionEndOfLocalDayIso / effectiveReunionEndIso', () => {
  it('effective end falls back to end of start day when no explicit end', () => {
    const tz = deviceTimeZone();
    const start = reunionIsoFromLocalDate(new Date(2026, 5, 10));
    const end = effectiveReunionEndIso(start, undefined, tz);
    const endDay = calendarDateForReunionPicker(end, tz);
    expect(endDay.getFullYear()).toBe(2026);
    expect(endDay.getMonth()).toBe(5);
    expect(endDay.getDate()).toBe(10);
  });
});

describe('reunionIsoFromYmdInZone / ymdInZoneFromIso', () => {
  const ny = 'America/New_York';

  it('anchors noon in the given zone', () => {
    const iso = reunionIsoFromYmdInZone('2026-06-10', ny);
    expect(ymdInZoneFromIso(iso, ny)).toBe('2026-06-10');
  });

  it('end-of-day stays on same calendar date in zone', () => {
    const iso = reunionEndOfDayIsoFromYmdInZone('2026-06-10', ny);
    expect(ymdInZoneFromIso(iso, ny)).toBe('2026-06-10');
  });
});

describe('visitCalendarDaysRemaining', () => {
  it('counts inclusive days through end in that zone', () => {
    const tz = 'UTC';
    const endIso = reunionEndOfDayIsoFromYmdInZone('2026-06-12', tz);
    const now = new Date('2026-06-10T15:00:00.000Z');
    expect(visitCalendarDaysRemaining(now, endIso, tz)).toBe(3);
  });
});

describe('localYmdIntersectsReunionVisit', () => {
  const utc = 'UTC';

  it('returns false when reunion start is missing or blank', () => {
    expect(localYmdIntersectsReunionVisit('2026-06-10', undefined, undefined, utc)).toBe(false);
    expect(localYmdIntersectsReunionVisit('2026-06-10', '', undefined, utc)).toBe(false);
  });

  it('is true for a wide window on a mid-range local day', () => {
    const start = '2020-01-01T12:00:00.000Z';
    const end = reunionEndOfDayIsoFromYmdInZone('2030-12-31', utc);
    expect(localYmdIntersectsReunionVisit('2025-06-15', start, end, utc)).toBe(true);
  });

  it('is false for a local day before the visit', () => {
    const start = reunionIsoFromYmdInZone('2026-06-10', utc);
    const end = reunionEndOfDayIsoFromYmdInZone('2026-06-12', utc);
    expect(localYmdIntersectsReunionVisit('1999-01-01', start, end, utc)).toBe(false);
  });

  it('single-day default end: intersects the home-zone calendar day of the start', () => {
    const start = reunionIsoFromYmdInZone('2026-06-10', utc);
    const ymd = ymdInZoneFromIso(start, utc);
    expect(localYmdIntersectsReunionVisit(ymd, start, undefined, utc)).toBe(true);
  });

  it('boundary: last instant of visit still intersects that calendar day', () => {
    const start = reunionIsoFromYmdInZone('2026-06-10', utc);
    const end = reunionEndOfDayIsoFromYmdInZone('2026-06-12', utc);
    const endYmd = ymdInZoneFromIso(end, utc);
    expect(localYmdIntersectsReunionVisit(endYmd, start, end, utc)).toBe(true);
    expect(localYmdIntersectsReunionVisit('2028-01-01', start, end, utc)).toBe(false);
  });
});

describe('reunionVisitPhase', () => {
  const start = reunionIsoFromLocalDate(new Date(2026, 5, 10));
  const end = reunionEndOfLocalDayIso(new Date(2026, 5, 12));

  it('is upcoming before start', () => {
    expect(reunionVisitPhase(start, end, new Date(new Date(start).getTime() - 2 * 3600000))).toBe('upcoming');
  });
  it('is together after start', () => {
    expect(reunionVisitPhase(start, end, new Date(new Date(start).getTime() + 2 * 3600000))).toBe('together');
  });
  it('is ended after end instant', () => {
    expect(reunionVisitPhase(start, end, new Date(new Date(end).getTime() + 2 * 3600000))).toBe('ended');
  });
});

