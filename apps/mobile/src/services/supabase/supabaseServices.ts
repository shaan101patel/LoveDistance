import type { ServiceRegistry } from '@/services/ports';
import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';
import {
  filterPresencePostsInWeek,
  weekMetaFromMondayYmd,
} from '@/features/weeklyRecap/recapCandidateFilter';
import { initialPresencePosts, mockRelationshipDashboardSnapshot } from '@/services/mock/mockData';
import { isSupabaseConfigured } from '@/services/supabase/client';

function notReady<T>(name: string): Promise<T> {
  if (!isSupabaseConfigured) {
    return Promise.reject(
      new Error(
        `Supabase mode is enabled but EXPO_PUBLIC_SUPABASE_URL and key are not configured for ${name}.`,
      ),
    );
  }
  return Promise.reject(
    new Error(`${name} is not implemented yet. Build frontend flows with mocks first.`),
  );
}

export const supabaseServices: ServiceRegistry = {
  auth: {
    getSession: () => notReady('auth.getSession'),
    signIn: () => notReady('auth.signIn'),
    signUp: () => notReady('auth.signUp'),
    updateProfile: () => notReady('auth.updateProfile'),
    signOut: () => notReady('auth.signOut'),
  },
  couple: {
    getCouple: () => notReady('couple.getCouple'),
    createInviteLink: () => notReady('couple.createInviteLink'),
    acceptInvite: () => notReady('couple.acceptInvite'),
  },
  prompt: {
    getTodayPrompt: () => notReady('prompt.getTodayPrompt'),
    getPromptById: () => notReady('prompt.getPromptById'),
    submitPromptAnswer: () => notReady('prompt.submitPromptAnswer'),
    reactToPrompt: () => notReady('prompt.reactToPrompt'),
  },
  threadInteraction: {
    getThreadActivity: () => notReady('threadInteraction.getThreadActivity'),
    addThreadReply: () => notReady('threadInteraction.addThreadReply'),
    reactToThreadReply: () => notReady('threadInteraction.reactToThreadReply'),
  },
  presence: {
    getLatestPosts: () => notReady('presence.getLatestPosts'),
    sharePost: () => notReady('presence.sharePost'),
    reactToPost: () => notReady('presence.reactToPost'),
  },
  habits: {
    getHabitsForMonth: () => notReady('habits.getHabitsForMonth'),
    getHabitById: () => notReady('habits.getHabitById'),
    toggleHabitCompletion: () => notReady('habits.toggleHabitCompletion'),
  },
  rituals: {
    logRitualSignal: () => notReady('rituals.logRitualSignal'),
    listRecentRitualSignals: () => notReady('rituals.listRecentRitualSignals'),
  },
  timeline: {
    listMemories: () => notReady('timeline.listMemories'),
    getMemoryById: () => notReady('timeline.getMemoryById'),
    setMemoryFavorite: () => notReady('timeline.setMemoryFavorite'),
  },
  followUpSuggestions: {
    suggestForReceivedPhoto: () => notReady('followUpSuggestions.suggestForReceivedPhoto'),
  },
  notificationPrefs: {
    getPreferences: () => notReady('notificationPrefs.getPreferences'),
    updatePreferences: () => notReady('notificationPrefs.updatePreferences'),
  },
  notificationInbox: {
    listInbox: () => notReady('notificationInbox.listInbox'),
    markRead: () => notReady('notificationInbox.markRead'),
    markAllRead: () => notReady('notificationInbox.markAllRead'),
  },
  userSettings: {
    getPrivacy: () => notReady('userSettings.getPrivacy'),
    updatePrivacy: () => notReady('userSettings.updatePrivacy'),
    getAppLock: () => notReady('userSettings.getAppLock'),
    updateAppLock: () => notReady('userSettings.updateAppLock'),
  },
  deepLinks: {
    parseUrl: parseDeepLink,
    toPath: getPathFromRef,
  },
  relationshipDashboard: {
    /** Placeholder: same mock snapshot until a Supabase-backed analytics API exists. */
    async getSnapshot() {
      return mockRelationshipDashboardSnapshot;
    },
  },
  subscription: {
    /** Placeholder until RevenueCat / Stripe / server entitlements. */
    async getSubscription() {
      return { tier: 'free' as const, renewsAtIso: null, source: 'store' as const };
    },
  },
  weeklyRecap: {
    /**
     * Read-only recap UI: frozen seed posts + placeholder draft until recap API + LLM exist.
     */
    async listPhotoCandidatesForWeek(anchorIso) {
      return filterPresencePostsInWeek([...initialPresencePosts], anchorIso);
    },
    async buildRecapDraft({ weekStartYmd, selectedPhotoIds }) {
      const uniq = [...new Set(selectedPhotoIds)].slice(0, 5);
      if (uniq.length === 0) {
        throw new Error('Pick at least one photo for your recap.');
      }
      const week = weekMetaFromMondayYmd(weekStartYmd);
      const byId = new Map(initialPresencePosts.map((p) => [p.id, p]));
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
