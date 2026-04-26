import type { ServiceRegistry } from '@/services/ports';
import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';
import { weekMetaFromMondayYmd } from '@/features/weeklyRecap/recapCandidateFilter';
import { isSupabaseConfigured, supabaseClient } from '@/services/supabase/client';
import { loadProfileRow, requireClient, toSession } from '@/services/supabase/helpers';
import * as backend from '@/services/supabase/supabaseBackend';
import type { Session, SubscriptionTier } from '@/types/domain';

const FOLLOW_UP_SUGGESTIONS = [
  'What was going through your mind in that moment?',
  'I love that you shared this—what do you want to do more of together?',
  'Should we make this a new little tradition for us?',
];

function suggestFollowUpsRotated(input: {
  imageUri: string;
  promptQuestion: string;
  partnerName?: string;
}): string[] {
  void input.partnerName;
  const n = (input.imageUri.length + input.promptQuestion.length) % FOLLOW_UP_SUGGESTIONS.length;
  return [0, 1, 2].map((i) => FOLLOW_UP_SUGGESTIONS[(n + i) % FOLLOW_UP_SUGGESTIONS.length]);
}

async function refreshSession(): Promise<Session> {
  const sb = requireClient();
  const { data: sessionData, error: sessErr } = await sb.auth.getSession();
  if (sessErr || !sessionData.session?.user) {
    throw new Error(sessErr?.message ?? 'Not signed in');
  }
  const user = sessionData.session.user;
  const profile = await loadProfileRow(user.id);
  return toSession(user, profile);
}

export const supabaseServices: ServiceRegistry = {
  auth: {
    async getSession() {
      if (!isSupabaseConfigured || !supabaseClient) return null;
      const { data, error } = await supabaseClient.auth.getSession();
      if (error || !data.session?.user) {
        return null;
      }
      const profile = await loadProfileRow(data.session.user.id);
      return toSession(data.session.user, profile);
    },
    async signIn({ email, password }) {
      const sb = requireClient();
      const trimmed = email.trim();
      if (!trimmed || !password) {
        throw new Error('Email and password are required');
      }
      const { data, error } = await sb.auth.signInWithPassword({ email: trimmed, password });
      if (error || !data.user) {
        const msg = error?.message ?? 'Sign in failed';
        if (/email not confirmed|confirm your email/i.test(msg)) {
          throw new Error('Please confirm your email before signing in.');
        }
        throw new Error(msg);
      }
      const profile = await loadProfileRow(data.user.id);
      return toSession(data.user, profile);
    },
    async signUp({ email, password, firstName }) {
      const sb = requireClient();
      const trimmed = email.trim();
      if (!trimmed || !password) {
        throw new Error('Email and password are required');
      }
      if (!firstName?.trim()) {
        throw new Error('First name is required');
      }
      const { data, error } = await sb.auth.signUp({
        email: trimmed,
        password,
        options: { data: { first_name: firstName.trim() } },
      });
      if (error || !data.user) {
        throw new Error(error?.message ?? 'Sign up failed');
      }
      if (!data.session) {
        throw new Error(
          'Check your email to confirm your account, then sign in. You are not signed in yet.',
        );
      }
      const profile = await loadProfileRow(data.user.id);
      return toSession(data.user, profile);
    },
    async updateProfile(partial) {
      const sb = requireClient();
      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) {
        throw new Error('Not signed in');
      }
      const patch: { first_name?: string; display_name?: string | null } = {};
      if (partial.firstName !== undefined) {
        patch.first_name = partial.firstName.trim();
      }
      if (partial.displayName !== undefined) {
        const d = partial.displayName.trim();
        patch.display_name = d.length ? d : null;
      }
      if (Object.keys(patch).length > 0) {
        const { error } = await sb.from('profiles').update(patch).eq('id', user.id);
        if (error) {
          throw new Error(error.message);
        }
      }
      return refreshSession();
    },
    async signOut() {
      const sb = requireClient();
      const { error } = await sb.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
  },
  couple: {
    getCouple: () => backend.loadCompleteCoupleProfile(),
    createInviteLink: () => backend.createInviteLinkRpc(),
    acceptInvite: (token) => backend.acceptInviteWithEdge(token),
  },
  prompt: {
    getTodayPrompt: () => backend.getTodayPrompt(),
    getPromptById: (id) => backend.getPromptById(id),
    submitPromptAnswer: (promptId, input) => backend.submitPromptAnswer(promptId, input),
    reactToPrompt: (promptId, emoji) => backend.reactToPrompt(promptId, emoji),
  },
  threadInteraction: {
    getThreadActivity: (promptId) => backend.getThreadActivity(promptId),
    addThreadReply: (input) => backend.addThreadReply(input),
    reactToThreadReply: (input) => backend.reactToThreadReply(input),
  },
  presence: {
    getLatestPosts: () => backend.getLatestPosts(),
    sharePost: (input) => backend.sharePost(input),
    reactToPost: (postId) => backend.reactToPost(postId),
  },
  habits: {
    getHabitsForMonth: (monthKey) => backend.getHabitsForMonth(monthKey),
    getHabitById: (habitId) => backend.getHabitById(habitId),
    toggleHabitCompletion: (habitId, date) => backend.toggleHabitCompletion(habitId, date),
  },
  rituals: {
    logRitualSignal: (kind, body) => backend.logRitualSignal(kind, body),
    listRecentRitualSignals: (limit) => backend.listRecentRitualSignals(limit),
  },
  timeline: {
    listMemories: (filter) => backend.listMemories(filter),
    getMemoryById: (id) => backend.getMemoryById(id),
    setMemoryFavorite: (id, fav) => backend.setMemoryFavorite(id, fav),
  },
  followUpSuggestions: {
    suggestForReceivedPhoto: async (input) => suggestFollowUpsRotated(input),
  },
  notificationPrefs: {
    getPreferences: () => backend.getPreferences(),
    updatePreferences: (prefs) => backend.updatePreferences(prefs),
  },
  notificationInbox: {
    listInbox: (limit) => backend.listInbox(limit),
    markRead: (ids) => backend.markRead(ids),
    markAllRead: () => backend.markAllRead(),
  },
  userSettings: {
    getPrivacy: () => backend.getPrivacy(),
    updatePrivacy: (partial) => backend.updatePrivacy(partial),
    getAppLock: () => backend.getAppLock(),
    updateAppLock: (partial) => backend.updateAppLock(partial),
  },
  deepLinks: {
    parseUrl: parseDeepLink,
    toPath: getPathFromRef,
  },
  relationshipDashboard: {
    getSnapshot: () => backend.getRelationshipDashboardSnapshot(),
  },
  subscription: {
    async getSubscription() {
      const sb = requireClient();
      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) {
        return { tier: 'free' as const, renewsAtIso: null, source: 'store' as const };
      }
      const row = await loadProfileRow(user.id);
      const tier = row?.subscription_tier === 'premium' ? ('premium' as const) : ('free' as const);
      return { tier, renewsAtIso: null, source: 'store' as const };
    },
    async setMockTier(tier: SubscriptionTier) {
      const sb = requireClient();
      const { data: userData } = await sb.auth.getUser();
      const user = userData.user;
      if (!user) {
        throw new Error('Not signed in');
      }
      const { error } = await sb
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id);
      if (error) {
        throw new Error(error.message);
      }
      return supabaseServices.subscription.getSubscription();
    },
  },
  weeklyRecap: {
    listPhotoCandidatesForWeek: (anchorIso) => backend.listPhotoCandidatesForWeek(anchorIso),
    async buildRecapDraft({ weekStartYmd, selectedPhotoIds }) {
      const uniq = [...new Set(selectedPhotoIds)].slice(0, 5);
      if (uniq.length === 0) {
        throw new Error('Pick at least one photo for your recap.');
      }
      const week = weekMetaFromMondayYmd(weekStartYmd);
      const pool = await backend.getLatestPosts();
      const byId = new Map(pool.map((p) => [p.id, p]));
      const selectedPhotos = uniq.map((id) => {
        const p = byId.get(id);
        if (!p) {
          throw new Error(`Unknown photo: ${id}`);
        }
        return p;
      });
      return {
        week,
        selectedPhotos,
        bestQuestion: { status: 'placeholder' as const },
        bestMoment: { status: 'placeholder' as const },
      };
    },
  },
};
