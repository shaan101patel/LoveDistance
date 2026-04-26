import { Redirect, Stack, usePathname } from 'expo-router';

import { useSessionStore } from '@/features/session/sessionStore';

export default function AppLayout() {
  const pathname = usePathname();
  const isSignedIn = useSessionStore((state) => state.isSignedIn);
  const isPaired = useSessionStore((state) => state.isPaired);
  const setReturnPath = useSessionStore((state) => state.setReturnPath);

  if (!isSignedIn) {
    setReturnPath(pathname);
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isPaired) {
    setReturnPath(pathname);
    return <Redirect href="/(onboarding)/pairing" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: 'Prompt thread' }} />
      <Stack.Screen name="memory/[memoryId]" options={{ title: 'Memory' }} />
      <Stack.Screen name="photo/[photoId]" options={{ title: 'Photo' }} />
      <Stack.Screen name="habit/[habitId]" options={{ title: 'Habit' }} />
      <Stack.Screen name="design-system" options={{ title: 'Design system', headerShown: false }} />
    </Stack>
  );
}
