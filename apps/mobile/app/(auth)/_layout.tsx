import { Stack } from 'expo-router';

import { preAuthHeaderStackOptions } from '@/components/navigation/preAuthHeaderStackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function AuthLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={preAuthHeaderStackOptions(theme)}>
      <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
      <Stack.Screen name="guest-profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
