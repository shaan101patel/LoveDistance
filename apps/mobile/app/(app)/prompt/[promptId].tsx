import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function PromptThreadScreen() {
  const { promptId } = useLocalSearchParams<{ promptId: string }>();
  const theme = useTheme();

  return (
    <Screen>
      <Heading>Prompt thread</Heading>
      <SectionCard>
        <Text style={{ color: theme.colors.textSecondary }}>Prompt id: {promptId}</Text>
        <Body>Placeholder page for prompt answer thread, reveal state, and reactions.</Body>
      </SectionCard>
    </Screen>
  );
}
