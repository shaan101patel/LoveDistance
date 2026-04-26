import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';

import { isPendingInvitePath, toOnboardingInviteHref } from '@/features/session/postAuthRoute';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';

export default function Index() {
  const isSignedIn = useSessionStore((s) => s.isSignedIn);
  const isPaired = useSessionStore((s) => s.isPaired);
  const returnPath = useSessionStore((s) => s.returnPath);
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

  if (returnPath?.startsWith('/(app)')) {
    return <Redirect href={returnPath as Href} />;
  }

  if (returnPath && isPendingInvitePath(returnPath)) {
    return <Redirect href={toOnboardingInviteHref(returnPath)} />;
  }

  return <Redirect href="/(app)/(tabs)/home" />;
}
