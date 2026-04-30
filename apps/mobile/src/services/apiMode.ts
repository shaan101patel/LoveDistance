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
  pairedSuccessIntroBody(live: boolean): string {
    return live
      ? 'Your couple is saved to your account. Both of you stay in sync when you use LoveDistance on your devices.'
      : 'Mock data only on this device—Supabase will persist this couple record and keep devices in sync when you use live mode.';
  },
  pairedSuccessReunionLine(live: boolean, formattedDate: string): string {
    return live
      ? `Reunion visit: ${formattedDate}.`
      : `Next reunion penciled for ${formattedDate} (sample date in mock mode on this device).`;
  },
};

/** Relationship settings labels; branch on `EXPO_PUBLIC_API_MODE`. */
export const relationshipSettingsCopy = {
  coupleIdLabel(live: boolean): string {
    return live ? 'Couple id' : 'Couple id (mock session)';
  },
  rhythmLinkLabel(live: boolean): string {
    return live ? 'Your rhythm — gentle trends' : 'Your rhythm — gentle trends (mock sample)';
  },
  newInviteBlockedNote(live: boolean): string {
    return live
      ? 'While you are paired, creating a new invite is blocked—the same rule the server enforces for your account.'
      : 'Creating a new invite is blocked in mock mode while you are already paired, matching a sensible server rule.';
  },
};

/** Privacy screen; branch on live Supabase (prefs sync to `user_app_settings`). */
export const privacyScreenCopy = {
  lead(live: boolean): string {
    return live
      ? 'These toggles sync to your account where supported. Presence and analytics behavior follows what we ship in each release.'
      : 'Same shape as a future `user_settings` or `profiles` row in Supabase. In mock mode, nothing leaves this device.';
  },
  sharePresenceDescription(live: boolean): string {
    return live
      ? 'Let your partner see when you are active in the app (when presence is available for your build).'
      : 'Let your partner see when you open the app in mock mode (no real presence yet).';
  },
  productAnalyticsDescription(live: boolean): string {
    return live
      ? 'Opt in to anonymized product analytics when we offer it; this build may not send events yet.'
      : 'Placeholder only — this build does not send analytics.';
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
  openThreadLinkLabel(_live: boolean): string {
    return "Open today's prompt";
  },
  plusUnlockedBody(live: boolean): string {
    return live
      ? 'You are on Plus. Themed prompt packs will appear here in a future release.'
      : 'You are on Plus (mock). Themed prompt packs will appear here in a future release.';
  },
};

/** Timeline tab lead; branch on `EXPO_PUBLIC_API_MODE`. */
export const timelineTabCopy = {
  tabLead(live: boolean): string {
    return live
      ? 'Prompts, photos, and shared moments from your couple show here—synced when you use Supabase.'
      : 'Prompts, photos, and moments in one place—local mock data until the backend is wired.';
  },
};

/** Photos tab lead; branch on `EXPO_PUBLIC_API_MODE`. */
export const photosTabCopy = {
  tabLead(live: boolean): string {
    return live
      ? 'Share a still from your day. Your couple feed is stored in Supabase for you and your partner.'
      : 'Share a still from your day. Everything here is local mock data until the backend is wired.';
  },
};

/** Home quick-link hints under the feed. */
export const homeQuickLinksCopy = {
  rhythmHint(live: boolean): string {
    return live
      ? 'Warm trends from your time together'
      : 'Warm trends from your time together (mock sample)';
  },
  recapHint(live: boolean): string {
    return live ? 'Pick up to five photos for your week' : 'Pick up to five photos for your week (mock)';
  },
  alertsHint(live: boolean): string {
    return live ? 'Notification center' : 'Notification center (mock events)';
  },
};

/** Calendar tab strings that referenced mock-only rules. */
export const calendarTabCopy = {
  habitChangeDeniedMock(live: boolean): string {
    return live
      ? 'You can’t change this day for this habit.'
      : 'You can’t change this day (mock rules for this habit).';
  },
  emptyMonthBody(live: boolean): string {
    return live
      ? 'No habits for this month yet. When you add some, they will show up here.'
      : 'No habits for this month yet. When you add some, they will show up here (mock data).';
  },
};

export const photoDetailCopy = {
  notFoundBody(live: boolean): string {
    return live
      ? 'We could not find this photo in your feed. It may have been removed.'
      : 'We could not find this photo in your local feed. It may have been removed in mock data.';
  },
};

export const photoComposeCopy = {
  demoImageHint(live: boolean): string {
    return live
      ? 'Uses a built-in sample image—no photo library permission needed.'
      : 'No photos permission needed—local mock only (built-in sample image).';
  },
};

export const quickSignalScreenCopy = {
  goodNightLead(live: boolean): string {
    return live
      ? 'A short line your partner can read when they wake up. Saved for your couple (push when enabled).'
      : 'A short line your partner can read when they wake up. Saved in mock data only—no push yet.';
  },
  missYouLead(live: boolean): string {
    return live
      ? 'Tell them you are thinking of them. Saved for your couple (push when enabled).'
      : 'Tell them you are thinking of them. Mock-only log for now.';
  },
};

export const securityScreenCopy = {
  scaffoldLead(live: boolean): string {
    return live
      ? 'Passcode and Face ID / Touch ID sync as preferences on your account; native device lock UI will plug in here in a future release.'
      : 'Expo + native Keychain and LocalAuthentication will plug in here. For now, toggles only update mock state.';
  },
  passcodeRowDescription(live: boolean): string {
    return live
      ? 'Require a passcode before opening the app. Full device lock UI is coming; this toggle records your preference on your account.'
      : 'Mock: we mark a passcode as “set” without storing digits. Turning this off clears Face ID / Touch ID in mock mode.';
  },
  biometricRowDescriptionWhenPasscodeOn(live: boolean): string {
    return live
      ? 'Use Face ID or Touch ID after passcode is enabled (device integration coming).'
      : 'Mock only — your device will use real biometrics in the production app.';
  },
  passcodeStatusLine(live: boolean, isSet: boolean): string {
    const state = isSet ? 'set' : 'not set';
    return live ? `Passcode preference: ${state}` : `Passcode status (mock): ${state}`;
  },
};

export const settingsHubCopy = {
  notificationsRowDescription(live: boolean): string {
    return live
      ? 'Partner alerts, scheduled reminders, and notification previews'
      : 'What we can nudge you about (mock)';
  },
  privacyRowDescription(live: boolean): string {
    return live
      ? 'Presence, analytics opt-in, notification previews'
      : 'Presence, analytics placeholder, notification previews';
  },
  securityRowDescription(live: boolean): string {
    return live
      ? 'Passcode and Face ID / Touch ID (preference sync; native lock UI upcoming)'
      : 'Passcode and Face ID / Touch ID placeholders';
  },
};

export const relationshipDashboardCopy = {
  plusPreviewBody(live: boolean): string {
    return live
      ? 'Longer windows and exports will live here on Plus. Seasonal trends remain preview data until a dedicated analytics pipeline ships.'
      : 'Longer windows and exports will live here on Plus. Still sample data until a real analytics backend ships.';
  },
};

export const weeklyRecapSummaryCopy = {
  scaffoldLead(live: boolean): string {
    return live
      ? 'A soft summary of what you chose—ranking highlights will use your couple data when the next version ships.'
      : 'A soft summary of what you chose—ranking highlights will appear here when the next version ships.';
  },
};
