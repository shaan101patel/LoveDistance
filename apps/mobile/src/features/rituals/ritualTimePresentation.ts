import { formatInTimeZone, toDate } from 'date-fns-tz';

import { formatYmdLocal, parseYmdLocal } from '@/lib/calendarDates';

/**
 * Fallback IANA zones when partner has not set `profiles.time_zone`.
 */
export const MOCK_ME_TIME_ZONE = 'America/Los_Angeles' as const;
export const MOCK_PARTNER_TIME_ZONE = 'Europe/London' as const;

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatYmdInTimeZone(d: Date, timeZone: string): string {
  return formatInTimeZone(d, timeZone, 'yyyy-MM-dd');
}

/** Calendar `YYYY-MM-DD` for an instant in `timeZone`. */
export function ymdInZoneFromIso(iso: string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), timeZone, 'yyyy-MM-dd');
}

/** Noon on the given calendar day in `timeZone`, as ISO UTC string (reunion start anchor). */
export function reunionIsoFromYmdInZone(ymd: string, timeZone: string): string {
  const trimmed = ymd.trim();
  const d = toDate(`${trimmed}T12:00:00`, { timeZone });
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid reunion date: ${ymd}`);
  }
  return d.toISOString();
}

/** End of calendar day in `timeZone` (23:59:59.999), as ISO UTC string. */
export function reunionEndOfDayIsoFromYmdInZone(ymd: string, timeZone: string): string {
  const trimmed = ymd.trim();
  const d = toDate(`${trimmed}T23:59:59.999`, { timeZone });
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid reunion end date: ${ymd}`);
  }
  return d.toISOString();
}

/**
 * `Date` at local midnight for the reunion’s calendar day in `timeZone` (face-value Y/M/D for pickers).
 */
export function calendarDateForReunionPicker(reunionIso: string, timeZone: string): Date {
  const ymd = ymdInZoneFromIso(reunionIso, timeZone);
  const parsed = parseYmdLocal(ymd);
  if (!parsed) {
    return new Date(reunionIso);
  }
  return parsed;
}

/** @deprecated Prefer `calendarDateForReunionPicker(iso, deviceTimeZone())` */
export function localCalendarDateFromReunionIso(reunionIso: string): Date {
  return calendarDateForReunionPicker(reunionIso, deviceTimeZone());
}

/** @deprecated Prefer `reunionIsoFromYmdInZone` with explicit zone */
export function reunionIsoFromLocalDate(d: Date): string {
  const ymd = formatYmdLocal(d);
  return reunionIsoFromYmdInZone(ymd, deviceTimeZone());
}

/** @deprecated Prefer `reunionEndOfDayIsoFromYmdInZone` with explicit zone */
export function reunionEndOfLocalDayIso(d: Date): string {
  const ymd = formatYmdLocal(d);
  return reunionEndOfDayIsoFromYmdInZone(ymd, deviceTimeZone());
}

export function formatClockInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function hourInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const h = parts.find((p) => p.type === 'hour')?.value;
  return h != null ? Number(h) : 0;
}

export function partnerRelativeDaypart(now: Date, partnerTimeZone: string): string {
  const h = hourInTimeZone(now, partnerTimeZone);
  if (h >= 5 && h < 12) return 'morning there';
  if (h >= 12 && h < 17) return 'afternoon there';
  if (h >= 17 && h < 22) return 'evening there';
  if (h >= 22 || h < 5) return 'late night there';
  return 'there';
}

export type ReunionCountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  isPast: boolean;
};

export function reunionCountdownParts(reunionIso: string, now: Date): ReunionCountdownParts {
  const target = new Date(reunionIso);
  const totalMs = target.getTime() - now.getTime();
  const isPast = totalMs <= 0;
  if (isPast) {
    return { totalMs, days: 0, hours: 0, isPast: true };
  }
  const totalHours = Math.floor(totalMs / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { totalMs, days, hours, isPast: false };
}

export function effectiveReunionEndIso(
  startIso: string,
  endIso: string | undefined,
  timeZone: string,
): string {
  if (endIso) {
    return endIso;
  }
  const ymd = ymdInZoneFromIso(startIso, timeZone);
  return reunionEndOfDayIsoFromYmdInZone(ymd, timeZone);
}

export type ReunionVisitPhase = 'upcoming' | 'together' | 'ended';

export function reunionVisitPhase(
  startIso: string,
  endIso: string | undefined,
  now: Date,
  timeZone: string = deviceTimeZone(),
): ReunionVisitPhase {
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(effectiveReunionEndIso(startIso, endIso, timeZone)).getTime();
  const t = now.getTime();
  if (t < startMs) return 'upcoming';
  if (t <= endMs) return 'together';
  return 'ended';
}

export function visitCalendarDaysRemaining(now: Date, endIso: string, timeZone: string): number {
  const nowYmd = formatYmdInTimeZone(now, timeZone);
  const endYmd = ymdInZoneFromIso(endIso, timeZone);
  const nowDay = parseYmdLocal(nowYmd);
  const endDay = parseYmdLocal(endYmd);
  if (!nowDay || !endDay) return 0;
  const diffDays = Math.round((endDay.getTime() - nowDay.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diffDays + 1);
}

/** Short reunion line for headers (weekday, month, day, year) in `timeZone`. */
export function reunionDateLabelInZone(iso: string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), timeZone, 'EEE, MMM d, yyyy');
}

export function formatReunionInBothZones(
  reunionIso: string,
  meTimeZone: string,
  partnerTimeZone: string,
): { meLine: string; partnerLine: string } {
  const d = new Date(reunionIso);
  return {
    meLine: `You: ${formatClockInTimeZone(d, meTimeZone)}`,
    partnerLine: `Them: ${formatClockInTimeZone(d, partnerTimeZone)}`,
  };
}
