import { describe, expect, it } from 'vitest';

import { formatNotificationRelativeTime, notificationCategoryTitle } from '@/features/notifications/inboxLabels';

describe('notificationCategoryTitle', () => {
  it('returns a label for each category', () => {
    expect(notificationCategoryTitle('prompt').length).toBeGreaterThan(2);
    expect(notificationCategoryTitle('countdown')).toContain('Countdown');
  });
});

describe('formatNotificationRelativeTime', () => {
  const now = new Date('2026-04-26T12:00:00.000Z');

  it('formats minutes ago', () => {
    const iso = '2026-04-26T11:30:00.000Z';
    expect(formatNotificationRelativeTime(iso, now)).toBe('30m ago');
  });

  it('formats just now', () => {
    const iso = '2026-04-26T11:59:30.000Z';
    expect(formatNotificationRelativeTime(iso, now)).toBe('Just now');
  });
});
