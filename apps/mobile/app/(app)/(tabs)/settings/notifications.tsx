import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { SettingsLinkRow, SettingsSubheading, SettingsToggleRow } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useNotificationPreferences } from '@/features/hooks';
import type { NotificationPrefs } from '@/types/domain';
import { spacing } from '@/theme/tokens';

const ROWS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  {
    key: 'unansweredPrompt',
    label: 'Daily prompt',
    description: "Remind me when I haven't answered today's question",
  },
  {
    key: 'newPhoto',
    label: 'New photo',
    description: 'When your partner shares in the room',
  },
  {
    key: 'reactions',
    label: 'Reactions',
    description: 'Hearts and replies on prompts and threads (mock)',
  },
  {
    key: 'habitReminder',
    label: 'Habit reminders',
    description: 'Nudges for shared check-ins and rituals (mock)',
  },
  {
    key: 'milestones',
    label: 'Milestones & streaks',
    description: 'Streak wins and small wins on the timeline (mock)',
  },
  {
    key: 'anniversaries',
    label: 'Anniversaries',
    description: 'Relationship dates and memory milestones (mock)',
  },
  {
    key: 'countdownUpdates',
    label: 'Countdown updates',
    description: 'Reunion countdown checkpoints (mock)',
  },
];

export default function SettingsNotificationsScreen() {
  const router = useRouter();
  const { query, mutation } = useNotificationPreferences();
  const prefs = query.data;

  const rows = useMemo(() => {
    if (!prefs) {
      return null;
    }
    return ROWS.map((row) => (
      <SettingsToggleRow
        key={row.key}
        description={row.description}
        label={row.label}
        onValueChange={(v) => mutation.mutate({ [row.key]: v })}
        value={prefs[row.key]}
      />
    ));
  }, [mutation, prefs]);

  return (
    <SectionScaffold
      kicker="Alerts"
      lead="Toggles are stored in the mock service only. A future build maps them to push topics and per-device prefs."
      title="Notifications"
    >
      {query.isLoading ? <Body>Loading…</Body> : null}
      {query.isError ? <Body>Could not load notification preferences.</Body> : null}
      {prefs ? (
        <>
          <SectionCard>
            <SettingsLinkRow
              label="Open notification center"
              description="Preview inbox grouped by category (mock events only)"
              onPress={() => router.push('/(app)/notifications' as Href)}
            />
          </SectionCard>
          <SectionCard>
            <SettingsSubheading>Channels</SettingsSubheading>
            <View style={{ gap: spacing.lg }}>{rows}</View>
          </SectionCard>
        </>
      ) : null}
    </SectionScaffold>
  );
}
