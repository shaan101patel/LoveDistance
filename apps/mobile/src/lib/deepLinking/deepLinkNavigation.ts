import { getPathFromRef } from '@/lib/deepLinking/deepLinkService';
import type { DeepLinkRef } from '@/types/domain';

export function targetPathFromRef(ref: DeepLinkRef): string {
  return getPathFromRef(ref);
}

/** Only `invite` resolves under onboarding; everything else is an app target. */
export function deepLinkRequiresFullAppAccess(ref: DeepLinkRef): boolean {
  return ref.kind !== 'invite';
}

export type DeepLinkGates = {
  isSignedIn: boolean;
  isPaired: boolean;
  explainerDone: boolean;
  profileSetupDone: boolean;
};

export function shouldDeferDeepLink(ref: DeepLinkRef, gates: DeepLinkGates): boolean {
  if (!deepLinkRequiresFullAppAccess(ref)) {
    return false;
  }
  const { isSignedIn, isPaired, explainerDone, profileSetupDone } = gates;
  return !isSignedIn || !isPaired || !explainerDone || !profileSetupDone;
}
