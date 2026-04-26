/**
 * Local-calendar helpers for week/month UIs. Date keys match habit mock `YYYY-MM-DD`.
 */

export function formatYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function fromMonthKey(key: string): Date {
  const [ys, ms] = key.split('-');
  return new Date(Number(ys), Number(ms) - 1, 1);
}

/** Add signed days in local time (avoids UTC drift for grid cells). */
export function addLocalDays(d: Date, delta: number): Date {
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + delta);
  return t;
}

/**
 * Monday 00:00 local of the ISO week (Mon–Sun) that contains `d`.
 */
export function getMondayOfWeek(d: Date): Date {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = t.getDay(); // 0 Sun
  const daysFromMon = (dow + 6) % 7;
  t.setDate(t.getDate() - daysFromMon);
  return t;
}

/** Seven `YYYY-MM-DD` strings Mon → Sun. */
export function getWeekYmdsForDay(anchor: Date): string[] {
  const mon = getMondayOfWeek(anchor);
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    out.push(formatYmdLocal(addLocalDays(mon, i)));
  }
  return out;
}

export type MonthGridCell = { ymd: string; inCurrentMonth: boolean; key: string };

/**
 * 6×7 = 42 cells, Monday-first, padding days from previous/next month.
 */
export function getMonthGridCells(visibleMonth: Date): MonthGridCell[] {
  const y = visibleMonth.getFullYear();
  const m = visibleMonth.getMonth();
  const first = new Date(y, m, 1);
  const startPad = (first.getDay() + 6) % 7;
  const out: MonthGridCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(y, m, 1 - startPad + i);
    const inCurrentMonth = d.getMonth() === m && d.getFullYear() === y;
    const ymd = formatYmdLocal(d);
    out.push({ ymd, inCurrentMonth, key: ymd });
  }
  return out;
}

export const WEEKDAY_LABELS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type WeekRangeLabelParts = {
  weekStartYmd: string;
  weekEndYmd: string;
  /** Human-readable Mon–Sun span for recap headers. */
  label: string;
};

/** Monday–Sunday local week containing `anchor`, with a short display label. */
export function getWeekRangeLabelParts(anchor: Date): WeekRangeLabelParts {
  const ymds = getWeekYmdsForDay(anchor);
  const mon = getMondayOfWeek(anchor);
  const sun = addLocalDays(mon, 6);
  const label = `${mon.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${sun.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  return { weekStartYmd: ymds[0]!, weekEndYmd: ymds[6]!, label };
}
