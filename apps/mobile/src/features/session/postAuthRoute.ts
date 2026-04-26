import type { Href } from 'expo-router';

type OnboardingFlags = {
  explainerDone: boolean;
  profileSetupDone: boolean;
};

const GROUPED_INVITE = '/(onboarding)/invite/';

export function isPendingInvitePath(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }
  if (path.includes(GROUPED_INVITE)) {
    return true;
  }
  // Expo sometimes reports routes without the group segment, e.g. /invite/abc
  return path.startsWith('/invite/') && path.length > '/invite/'.length;
}

/** Normalizes Expo path variants to a router href inside the (onboarding) group. */
export function toOnboardingInviteHref(path: string): Href {
  if (path.includes(GROUPED_INVITE)) {
    return path as Href;
  }
  if (path.startsWith('/invite/')) {
    const rest = path.slice('/invite/'.length);
    return `/(onboarding)/invite/${rest}` as Href;
  }
  return path as Href;
}

/**
 * After sign-in / sign-up: walk onboarding first, then deep-linked invite, then pairing.
 * Supabase can reuse the same decision tree; only the services backing session/couple change.
 */
export function getPostSignInHref(onboarding: OnboardingFlags, returnPath: string | null): Href {
  if (!onboarding.explainerDone) {
    return '/(onboarding)/explainer';
  }
  if (!onboarding.profileSetupDone) {
    return '/(onboarding)/profile-setup';
  }
  if (isPendingInvitePath(returnPath)) {
    return toOnboardingInviteHref(returnPath!);
  }
  return '/(onboarding)/pairing';
}

export function getPostProfileSetupHref(returnPath: string | null): Href {
  if (isPendingInvitePath(returnPath)) {
    return toOnboardingInviteHref(returnPath!);
  }
  return '/(onboarding)/pairing';
}
