import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function MemoryDetailScreen() {
  const { memoryId } = useLocalSearchParams<{ memoryId: string }>();
  const theme = useTheme();

  return (
    <Screen>
      <Heading>Memory</Heading>
      <SectionCard>
        <Text style={{ color: theme.colors.textSecondary }}>Memory id: {memoryId}</Text>
        <Body>Placeholder page for memory detail and timeline context.</Body>
      </SectionCard>
    </Screen>
  );
}
