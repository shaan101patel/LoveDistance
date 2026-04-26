import { formatYmdLocal, getWeekYmdsForDay } from '@/lib/calendarDates';
import type { PresencePost, WeeklyRecapWeekMeta } from '@/types/domain';

export function localYmdFromCreatedAtIso(iso: string): string {
  return formatYmdLocal(new Date(iso));
}

export function filterPresencePostsInWeek(posts: PresencePost[], anchorIso: string): PresencePost[] {
  const ymdSet = new Set(getWeekYmdsForDay(new Date(anchorIso)));
  return posts.filter((p) => ymdSet.has(localYmdFromCreatedAtIso(p.createdAt)));
}

/** `weekStartYmd` must be the Monday `YYYY-MM-DD` of that ISO week. */
export function weekMetaFromMondayYmd(weekStartYmd: string): WeeklyRecapWeekMeta {
  const [ys, ms, ds] = weekStartYmd.split('-');
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const monday = new Date(y, m - 1, d);
  const ymds = getWeekYmdsForDay(monday);
  const sun = new Date(y, m - 1, d + 6);
  const label = `${monday.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${sun.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  return { weekStartYmd: ymds[0]!, weekEndYmd: ymds[6]!, label };
}
