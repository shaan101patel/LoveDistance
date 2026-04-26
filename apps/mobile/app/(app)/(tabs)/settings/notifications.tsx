import { useMemo } from 'react';
import { View } from 'react-native';

import { SettingsSubheading, SettingsToggleRow } from '@/components/settings';
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
    key: 'habitReminder',
    label: 'Habits & rituals',
    description: 'Nudges for shared check-ins (mock)',
  },
  {
    key: 'milestones',
    label: 'Milestones',
    description: 'Streaks and small wins',
  },
];

export default function SettingsNotificationsScreen() {
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
        <SectionCard>
          <SettingsSubheading>Channels</SettingsSubheading>
          <View style={{ gap: spacing.lg }}>{rows}</View>
        </SectionCard>
      ) : null}
    </SectionScaffold>
  );
}
