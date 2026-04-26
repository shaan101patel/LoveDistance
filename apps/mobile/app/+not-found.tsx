import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { Body, Heading, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Heading>Page not found</Heading>
      <Body>This deep link or route is not available.</Body>
      <Link href="/">
        <Text style={{ color: theme.colors.primary }}>Return home</Text>
      </Link>
    </Screen>
  );
}
