import { effectiveReunionEndIso } from '@/features/rituals/ritualTimePresentation';

/** Add signed days to a UTC calendar `YYYY-MM-DD`. */
export function addUtcDays(ymd: string, delta: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) throw new Error(`Invalid UTC ymd: ${ymd}`);
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const t = new Date(Date.UTC(y, mo, d + delta));
  return t.toISOString().slice(0, 10);
}

function utcDayRangeMs(ymd: string): { start: number; end: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) throw new Error(`Invalid UTC ymd: ${ymd}`);
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const start = Date.UTC(y, mo, d);
  const end = start + 24 * 60 * 60 * 1000;
  return { start, end };
}

/**
 * True if the UTC half-open day [D 00:00Z, D+1 00:00Z) overlaps the reunion visit
 * interval [reunion_date, effectiveReunionEnd] (same end rule as the rest of the app).
 */
export function utcYmdIntersectsReunionInterval(
  utcYmd: string,
  reunionStartIso: string | null | undefined,
  reunionEndIso: string | null | undefined,
  homeTimeZone: string,
): boolean {
  const start = reunionStartIso?.trim();
  if (!start) return false;
  const visitStart = new Date(start).getTime();
  const visitEnd = new Date(effectiveReunionEndIso(start, reunionEndIso ?? undefined, homeTimeZone)).getTime();
  const { start: dayStart, end: dayEnd } = utcDayRangeMs(utcYmd);
  return dayStart < visitEnd && visitStart < dayEnd;
}

/** Every UTC ymd from minYmd through maxYmd inclusive that intersects the reunion window. */
export function graceUtcYmdsInInclusiveWindow(
  minYmd: string,
  maxYmd: string,
  reunionStartIso: string | null | undefined,
  reunionEndIso: string | null | undefined,
  homeTimeZone: string,
): Set<string> {
  const out = new Set<string>();
  if (!reunionStartIso?.trim()) return out;
  for (let d = minYmd; d <= maxYmd; d = addUtcDays(d, 1)) {
    if (utcYmdIntersectsReunionInterval(d, reunionStartIso, reunionEndIso, homeTimeZone)) {
      out.add(d);
    }
    if (d === maxYmd) break;
  }
  return out;
}

/** UTC ymd from an ISO timestamp (matches `couple_prompts.prompt_date` / prompt thread `date`). */
export function utcYmdFromIsoTimestamp(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Days where both `userA` and `userB` authored at least one presence post (UTC bucket).
 */
export function mutualPresenceUtcYmds(
  rows: { authorId: string; createdAt: string }[],
  userA: string,
  userB: string,
): Set<string> {
  const byDay = new Map<string, Set<string>>();
  for (const r of rows) {
    const day = utcYmdFromIsoTimestamp(r.createdAt);
    const s = byDay.get(day) ?? new Set<string>();
    s.add(r.authorId);
    byDay.set(day, s);
  }
  const out = new Set<string>();
  for (const [day, authors] of byDay) {
    if (authors.has(userA) && authors.has(userB)) {
      out.add(day);
    }
  }
  return out;
}

/**
 * Merges prompt reveal days, mutual presence days, and reunion grace into one satisfied set.
 */
export function mergeSatisfiedUtcYmds(input: {
  revealedPromptDates: string[];
  mutualPresenceDates: Set<string>;
  graceUtcYmds: Set<string>;
}): Set<string> {
  const out = new Set<string>();
  for (const d of input.revealedPromptDates) {
    out.add(d);
  }
  for (const d of input.mutualPresenceDates) {
    out.add(d);
  }
  for (const d of input.graceUtcYmds) {
    out.add(d);
  }
  return out;
}

/**
 * Consecutive satisfied UTC days ending at or before anchor. If anchor is not satisfied,
 * counting starts from the previous UTC day (so “today in progress” does not zero the UI).
 */
export function computeEngagementStreakDays(anchorYmd: string, satisfiedUtcYmds: Set<string>): number {
  let d = anchorYmd;
  if (!satisfiedUtcYmds.has(d)) {
    d = addUtcDays(anchorYmd, -1);
  }
  let streak = 0;
  while (satisfiedUtcYmds.has(d)) {
    streak += 1;
    d = addUtcDays(d, -1);
  }
  return streak;
}
