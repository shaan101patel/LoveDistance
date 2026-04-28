import { Stack } from 'expo-router';

import { preAuthHeaderStackOptions } from '@/components/navigation/preAuthHeaderStackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function OnboardingLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={preAuthHeaderStackOptions(theme)}>
      <Stack.Screen name="explainer" options={{ title: 'How it works' }} />
      <Stack.Screen name="profile-setup" options={{ title: 'Your profile' }} />
      <Stack.Screen name="pairing" options={{ title: 'Pairing' }} />
      <Stack.Screen name="invite/[token]" options={{ title: 'Invite' }} />
    </Stack>
  );
}
