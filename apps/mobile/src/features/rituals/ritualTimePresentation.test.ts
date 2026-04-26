import { describe, expect, it } from 'vitest';

import {
  MOCK_ME_TIME_ZONE,
  MOCK_PARTNER_TIME_ZONE,
  formatReunionInBothZones,
  partnerRelativeDaypart,
  reunionCountdownParts,
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

describe('formatReunionInBothZones', () => {
  it('returns two non-empty lines', () => {
    const lines = formatReunionInBothZones(
      '2026-12-25T18:00:00.000Z',
      MOCK_ME_TIME_ZONE,
      MOCK_PARTNER_TIME_ZONE,
    );
    expect(lines.meLine).toContain('You:');
    expect(lines.partnerLine).toContain('Them:');
    expect(lines.meLine.length).toBeGreaterThan(6);
    expect(lines.partnerLine.length).toBeGreaterThan(6);
  });
});
