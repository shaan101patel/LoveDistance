import type { NotificationCategory } from '@/types/domain';

const TITLES: Record<NotificationCategory, string> = {
  prompt: 'Prompt reminders',
  photo: 'New photos',
  reaction: 'Reactions',
  habit: 'Habit reminders',
  anniversary: 'Anniversaries',
  countdown: 'Countdown updates',
};

export function notificationCategoryTitle(category: NotificationCategory): string {
  return TITLES[category];
}

export function formatNotificationRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (diffMs < 60_000) return 'Just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
