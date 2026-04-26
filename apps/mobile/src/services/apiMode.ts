import { isSupabaseConfigured } from '@/services/supabase/client';

/** `EXPO_PUBLIC_API_MODE=supabase` — app uses Supabase service registry (may still fail at runtime if env keys missing). */
export function isSupabaseApiMode(): boolean {
  return (process.env.EXPO_PUBLIC_API_MODE ?? 'mock') === 'supabase';
}

/** True when Supabase client is constructed (URL + anon key set). */
export function usesConfiguredSupabase(): boolean {
  return isSupabaseApiMode() && isSupabaseConfigured;
}

/** Short copy for auth/settings screens; branch on `EXPO_PUBLIC_API_MODE`. */
export const authScreenCopy = {
  signInLead(live: boolean): string {
    return live
      ? 'Sign in with your LoveDistance account. Your session is stored securely on this device.'
      : 'Your session is stored locally in mock mode—perfect for building the full flow.';
  },
  signUpLead(live: boolean): string {
    return live
      ? 'Create your account. Your name is saved to your profile in Supabase.'
      : 'We use this to personalize the experience in mock mode—nothing leaves this device.';
  },
  settingsLead(live: boolean): string {
    return live
      ? 'Preferences and profile sync to your account where supported.'
      : 'MVP: preferences live in the mock in-memory store and reset on sign out.';
  },
  settingsSignOutDetail(live: boolean): string {
    return live
      ? 'Sign out ends your session on this device. Local-only preferences reset where they are not synced; your couple link stays with your account until you sign in again.'
      : 'Sign out clears mock session, pairing, notification prefs, privacy, and app lock state.';
  },
  settingsSignOutButtonLabel(live: boolean): string {
    return live ? 'Sign out' : 'Sign out (mock)';
  },
  relationshipSettingsLead(live: boolean): string {
    return live
      ? 'Your couple link, reunion date, and shared activity are stored in Supabase for this account.'
      : 'Couple record is mock in-memory. Supabase will store couple id, both user ids, and relationship metadata.';
  },
  relationshipDashboardLead(live: boolean): string {
    return live
      ? 'A gentle look back at prompts, timeline entries, and saved moments from your couple data.'
      : 'A gentle look back—sample rhythms from mock data until real analytics arrive.';
  },
};

/** Pairing / invite onboarding copy; branch on `EXPO_PUBLIC_API_MODE`. */
export const pairingScreenCopy = {
  createInviteLead(live: boolean): string {
    return live
      ? 'Create a secure invite. Your partner opens the link or pastes the code to join your couple space.'
      : 'We generate a one-time style invite for mock mode. Your partner can open the link or type the code.';
  },
  createInviteLoadingBody(live: boolean): string {
    return live ? 'Creating your invite…' : 'Creating a fresh invite for mock mode…';
  },
  enterCodeLead(live: boolean): string {
    return live
      ? 'Paste a lovedistance:// link or the invite code from your partner. Joining is validated on the server when you continue.'
      : 'Paste a lovedistance:// link or the short code. We resolve client-side for mock flows; production keeps this route.';
  },
  enterCodeFooterShape(): string {
    return 'Deep link shape: /(onboarding)/invite/TOKEN — same screen for manual entry and URL opens.';
  },
  /** Second footer paragraph; only for mock QA. */
  enterCodeFooterMockQa(live: boolean): string | null {
    if (live) {
      return null;
    }
    return 'Mock QA: type open-in-app or example for placeholder state; expired, used, or invalid for error copy.';
  },
  inviteJoinLead(live: boolean): string {
    return live
      ? 'You’re signed in. Accepting links this device to your couple in Supabase.'
      : 'You’re signed in. Joining will link this app to your couple space (mock: in-memory for now).';
  },
  inviteAlreadyPairedLead(live: boolean): string {
    return live
      ? 'You’re already linked with a partner on this account.'
      : 'You are already linked with someone in this build.';
  },
  inviteErrorRedeemedHint(live: boolean): string {
    return live
      ? 'This invite may already be used or was replaced. Ask your partner for a new link.'
      : 'This code was already redeemed in mock mode on this device.';
  },
  enterCodePlaceholderError(live: boolean): string {
    return live
      ? 'That token isn’t valid for joining. Use the invite link or code your partner sent.'
      : 'That is a placeholder. Use a real code from an invite, or try “expired” / “used” to see errors.';
  },
  pairingHubPairedLead(live: boolean): string {
    return live
      ? 'You’re linked with your partner on this account. Head home, or review invite links below.'
      : 'You’re already in a couple space. Head home, or read how mock invites work below.';
  },
  pairingHubPairedFooter(live: boolean): string {
    return live
      ? 'Unpairing from another device will arrive in a future build. To use a different account on this device, sign out in Settings.'
      : 'Unpair in a future build. For now, sign out in Settings to reset mock state and try again with a fresh “account”.';
  },
  pairingHubPairedCardBody(live: boolean): string {
    return live
      ? 'Your couple is stored with your account. Tabs stay unlocked while you’re signed in.'
      : 'This device already accepted an invite or created a successful link. Your tabs are unlocked.';
  },
  pairingHubUnpairedFooter(live: boolean): string {
    return live
      ? 'Create an invite or enter your partner’s code. Invite tokens use the inv-… shape and appear after invite/ in shared links and lovedistance:// URLs.'
      : 'Mock pairing: create a link, or enter a code. Real tokens use the inv-… shape (after invite/ in the URL). Try expired, used, or invalid in enter-code to see edge states.';
  },
};

/** Prompt tab placeholder copy; branch on `EXPO_PUBLIC_API_MODE`. */
export const promptTabCopy = {
  emptyTitle(live: boolean): string {
    return live ? 'Open today’s prompt from Home' : 'No prompt session yet';
  },
  emptyDescription(live: boolean): string {
    return live
      ? 'Your daily question, answers, delayed reveal, and thread live on Home and in the full prompt screen—this tab is for extras.'
      : 'The daily prompt, delayed reveal, and thread will show in this space.';
  },
  openThreadLinkLabel(live: boolean): string {
    return live ? 'Open sample prompt thread' : 'Open prompt thread placeholder';
  },
  plusUnlockedBody(live: boolean): string {
    return live
      ? 'You are on Plus. Themed prompt packs will appear here in a future release.'
      : 'You are on Plus (mock). Themed prompt packs will appear here in a future release.';
  },
};
