import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function HabitDetailScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const theme = useTheme();

  return (
    <Screen>
      <Heading>Habit detail</Heading>
      <SectionCard>
        <Text style={{ color: theme.colors.textSecondary }}>Habit id: {habitId}</Text>
        <Body>Placeholder page for calendar completion details and streaks.</Body>
      </SectionCard>
    </Screen>
  );
}
