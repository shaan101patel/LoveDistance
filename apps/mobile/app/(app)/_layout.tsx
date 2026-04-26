import { Redirect, Stack, usePathname } from 'expo-router';

import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';

export default function AppLayout() {
  const pathname = usePathname();
  const isSignedIn = useSessionStore((state) => state.isSignedIn);
  const isPaired = useSessionStore((state) => state.isPaired);
  const setReturnPath = useSessionStore((state) => state.setReturnPath);
  const welcomeSeen = useOnboardingStore((s) => s.welcomeSeen);
  const explainerDone = useOnboardingStore((s) => s.explainerDone);
  const profileSetupDone = useOnboardingStore((s) => s.profileSetupDone);

  if (!isSignedIn) {
    setReturnPath(pathname);
    if (!welcomeSeen) {
      return <Redirect href="/(auth)/welcome" />;
    }
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!explainerDone) {
    setReturnPath(pathname);
    return <Redirect href="/(onboarding)/explainer" />;
  }

  if (!profileSetupDone) {
    setReturnPath(pathname);
    return <Redirect href="/(onboarding)/profile-setup" />;
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
      <Stack.Screen name="photo/compose" options={{ title: 'New photo' }} />
      <Stack.Screen name="photo/[photoId]" options={{ title: 'Photo' }} />
      <Stack.Screen name="habit/[habitId]" options={{ title: 'Habit' }} />
      <Stack.Screen name="wake-check-in" options={{ title: 'Morning check-in' }} />
      <Stack.Screen name="ritual/quick-signal" options={{ title: 'Quick ritual' }} />
      <Stack.Screen name="notifications/index" options={{ title: 'Notifications' }} />
      <Stack.Screen name="design-system" options={{ title: 'Design system', headerShown: false }} />
    </Stack>
  );
}
