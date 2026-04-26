import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function PhotoDetailScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const theme = useTheme();

  return (
    <Screen>
      <Heading>Photo</Heading>
      <SectionCard>
        <Text style={{ color: theme.colors.textSecondary }}>Photo id: {photoId}</Text>
        <Body>Placeholder page for media detail, caption, and reactions.</Body>
      </SectionCard>
    </Screen>
  );
}
