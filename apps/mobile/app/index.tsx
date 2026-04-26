import { Redirect } from 'expo-router';

import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';

export default function Index() {
  const isSignedIn = useSessionStore((s) => s.isSignedIn);
  const isPaired = useSessionStore((s) => s.isPaired);
  const welcomeSeen = useOnboardingStore((s) => s.welcomeSeen);
  const explainerDone = useOnboardingStore((s) => s.explainerDone);
  const profileSetupDone = useOnboardingStore((s) => s.profileSetupDone);

  if (!isSignedIn) {
    if (!welcomeSeen) {
      return <Redirect href="/(auth)/welcome" />;
    }
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!explainerDone) {
    return <Redirect href="/(onboarding)/explainer" />;
  }

  if (!profileSetupDone) {
    return <Redirect href="/(onboarding)/profile-setup" />;
  }

  if (!isPaired) {
    return <Redirect href="/(onboarding)/pairing" />;
  }

  return <Redirect href="/(app)/(tabs)/home" />;
}
