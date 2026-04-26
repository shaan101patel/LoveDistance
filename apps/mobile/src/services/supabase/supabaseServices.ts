import type { ServiceRegistry } from '@/services/ports';
import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';
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
};
