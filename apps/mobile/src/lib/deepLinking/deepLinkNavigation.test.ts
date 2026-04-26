import {
  deepLinkRequiresFullAppAccess,
  shouldDeferDeepLink,
  targetPathFromRef,
} from '@/lib/deepLinking/deepLinkNavigation';
import type { DeepLinkRef } from '@/types/domain';

const gatesAllOk = {
  isSignedIn: true,
  isPaired: true,
  explainerDone: true,
  profileSetupDone: true,
} as const;

describe('deepLinkNavigation', () => {
  it('targetPathFromRef matches getPathFromRef for tab', () => {
    const ref: DeepLinkRef = { kind: 'tab', name: 'home' };
    expect(targetPathFromRef(ref)).toBe('/(app)/(tabs)/home');
  });

  it('invite does not require full app access', () => {
    expect(deepLinkRequiresFullAppAccess({ kind: 'invite', token: 't' })).toBe(false);
  });

  it('app targets require full app access', () => {
    expect(deepLinkRequiresFullAppAccess({ kind: 'tab', name: 'settings' })).toBe(true);
    expect(deepLinkRequiresFullAppAccess({ kind: 'notifications' })).toBe(true);
    expect(deepLinkRequiresFullAppAccess({ kind: 'settings', subsection: 'privacy' })).toBe(true);
    expect(deepLinkRequiresFullAppAccess({ kind: 'photo_compose' })).toBe(true);
  });

  it('never defers invite regardless of gates', () => {
    const invite: DeepLinkRef = { kind: 'invite', token: 'abc' };
    expect(shouldDeferDeepLink(invite, { ...gatesAllOk, isSignedIn: false })).toBe(false);
    expect(shouldDeferDeepLink(invite, { ...gatesAllOk, isPaired: false })).toBe(false);
  });

  it('defers app deep links when any gate fails', () => {
    const tab: DeepLinkRef = { kind: 'tab', name: 'calendar' };
    expect(shouldDeferDeepLink(tab, gatesAllOk)).toBe(false);
    expect(shouldDeferDeepLink(tab, { ...gatesAllOk, isSignedIn: false })).toBe(true);
    expect(shouldDeferDeepLink(tab, { ...gatesAllOk, isPaired: false })).toBe(true);
    expect(shouldDeferDeepLink(tab, { ...gatesAllOk, explainerDone: false })).toBe(true);
    expect(shouldDeferDeepLink(tab, { ...gatesAllOk, profileSetupDone: false })).toBe(true);
  });
});
