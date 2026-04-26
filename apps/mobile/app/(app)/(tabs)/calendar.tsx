import { Link } from 'expo-router';
import { Text } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function CalendarTabScreen() {
  const theme = useTheme();
  return (
    <SectionScaffold
      kicker="Rhythm"
      lead="Shared habits, visits, and gentle reminders on a time-aware calendar."
      title="Calendar"
    >
      <SectionCard>
        <EmptyState
          title="Calendar is ready for your routines"
          description="Week and month views, shared habits, and streaks will map here (mock data for now)."
        />
        <Link href="/(app)/habit/habit-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Habit / event detail placeholder
          </Text>
        </Link>
      </SectionCard>
    </SectionScaffold>
  );
}
