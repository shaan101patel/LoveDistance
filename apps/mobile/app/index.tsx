import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/session/sessionStore';

export default function Index() {
  const isSignedIn = useSessionStore((state) => state.isSignedIn);
  const isPaired = useSessionStore((state) => state.isPaired);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isPaired) {
    return <Redirect href="/(onboarding)/pairing" />;
  }

  return <Redirect href="/(app)/(tabs)/home" />;
}
