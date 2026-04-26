import { describe, expect, it } from 'vitest';

import { formatYmdLocal, fromMonthKey, getMonthGridCells, getMondayOfWeek, getWeekYmdsForDay, toMonthKey } from '@/lib/calendarDates';

describe('getMonthGridCells', () => {
  it('January 2026: Thu 1st → 3 lead pads, first cell is previous month', () => {
    const jan = fromMonthKey('2026-01');
    const cells = getMonthGridCells(jan);
    expect(cells).toHaveLength(42);
    // First of Jan 2026 is Thursday; Mon-first needs 3 padding days from Dec 2025
    expect(cells[0].ymd).toBe('2025-12-29');
    expect(cells[0].inCurrentMonth).toBe(false);
    expect(cells[3].ymd).toBe('2026-01-01');
    expect(cells[3].inCurrentMonth).toBe(true);
  });
});

describe('getMondayOfWeek and week strip', () => {
  it('2026-01-15 (Thu) week Mon–Sun', () => {
    const d = new Date(2026, 0, 15);
    const mon = getMondayOfWeek(d);
    expect(formatYmdLocal(mon)).toBe('2026-01-12');
    const ymds = getWeekYmdsForDay(d);
    expect(ymds).toEqual([
      '2026-01-12',
      '2026-01-13',
      '2026-01-14',
      '2026-01-15',
      '2026-01-16',
      '2026-01-17',
      '2026-01-18',
    ]);
  });
});

describe('toMonthKey', () => {
  it('round-trips with fromMonthKey', () => {
    const d = new Date(2026, 2, 5);
    expect(toMonthKey(d)).toBe('2026-03');
    expect(toMonthKey(fromMonthKey('2026-03'))).toBe('2026-03');
  });
});
