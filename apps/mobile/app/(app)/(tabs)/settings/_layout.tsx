import { Stack } from 'expo-router';

import { MeHeaderAvatarButton } from '@/components/navigation/MeHeaderAvatarButton';
import { useTheme } from '@/theme/ThemeProvider';

export default function SettingsStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: true,
        contentStyle: { backgroundColor: theme.colors.bg },
        headerRight: () => <MeHeaderAvatarButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="security" options={{ title: 'App lock' }} />
      <Stack.Screen name="relationship" options={{ title: 'Relationship' }} />
    </Stack>
  );
}
