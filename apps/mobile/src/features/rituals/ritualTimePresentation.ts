/**
 * Mock-only IANA zones for LDR presentation demos (no profile fields yet).
 */
export const MOCK_ME_TIME_ZONE = 'America/Los_Angeles' as const;
export const MOCK_PARTNER_TIME_ZONE = 'Europe/London' as const;

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

/**
 * Soft copy for “what time of day is it for them?” (hour buckets in partner zone).
 */
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
