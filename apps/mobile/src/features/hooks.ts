import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/services/ServiceContext';
import type { CoupleProfile, PresencePost } from '@/types/domain';

/** Couple space for the signed-in user; null when unpaired. Invalidated after pairing / sign-out flows. */
export function useCouple() {
  const services = useServices();
  return useQuery({
    queryKey: ['couple'],
    queryFn: (): Promise<CoupleProfile | null> => services.couple.getCouple(),
  });
}

/**
 * Resolves the signed-in user id, preferring the couple record’s `meId` when paired.
 */
export function useCurrentUserId() {
  const services = useServices();
  const { data: couple } = useCouple();
  const { data: session, isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });
  const meId = couple?.meId ?? session?.user.id ?? null;
  return { meId, isSessionLoading: isLoading };
}

export function useTodayPrompt() {
  const services = useServices();
  return useQuery({
    queryKey: ['prompt', 'today'],
    queryFn: () => services.prompt.getTodayPrompt(),
  });
}

/**
 * Stack / deep-link read path. Returns `data: null` when the id is unknown (mock) or 404 (future).
 */
export function usePromptThread(promptId: string | undefined) {
  const services = useServices();
  return useQuery({
    queryKey: ['prompt', 'thread', promptId] as const,
    queryFn: () => {
      if (!promptId) {
        throw new Error('promptId is required');
      }
      return services.prompt.getPromptById(promptId);
    },
    enabled: Boolean(promptId),
  });
}

function syncPromptQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  next: { promptId: string },
) {
  queryClient.setQueryData(['prompt', 'today'], next);
  queryClient.setQueryData(['prompt', 'thread', next.promptId], next);
}

export function useSubmitPrompt() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      promptId,
      answer,
      imageUri,
    }: {
      promptId: string;
      answer: string;
      imageUri: string | null;
    }) => services.prompt.submitPromptAnswer(promptId, { answer, imageUri }),
    onSuccess: (next) => {
      syncPromptQueries(queryClient, next);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useFollowUpSuggestions(input: {
  imageUri: string;
  promptQuestion: string;
  partnerName?: string;
}) {
  const services = useServices();
  return useQuery({
    queryKey: [
      'followUpSuggestions',
      input.imageUri,
      input.promptQuestion,
      input.partnerName ?? '',
    ] as const,
    queryFn: () => services.followUpSuggestions.suggestForReceivedPhoto(input),
    enabled: Boolean(input.imageUri && input.promptQuestion),
    staleTime: 1000 * 60 * 60,
  });
}

export function usePromptReaction() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, emoji }: { promptId: string; emoji: string }) =>
      services.prompt.reactToPrompt(promptId, emoji),
    onSuccess: (next) => {
      syncPromptQueries(queryClient, next);
    },
  });
}

/**
 * Follow-up messages and reply reactions for an unlocked thread (separate from `PromptThread`).
 */
export function useThreadActivity(
  promptId: string | undefined,
  options?: { enabled?: boolean },
) {
  const services = useServices();
  return useQuery({
    queryKey: ['threadActivity', promptId] as const,
    queryFn: () => {
      if (!promptId) {
        throw new Error('promptId is required');
      }
      return services.threadInteraction.getThreadActivity(promptId);
    },
    enabled: Boolean(promptId) && options?.enabled !== false,
  });
}

export function useAddThreadReply() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.threadInteraction.addThreadReply,
    onSuccess: (next) => {
      queryClient.setQueryData(['threadActivity', next.promptId], next);
    },
  });
}

export function useReactToThreadReply() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.threadInteraction.reactToThreadReply,
    onSuccess: (next) => {
      queryClient.setQueryData(['threadActivity', next.promptId], next);
    },
  });
}

export function usePresenceFeed() {
  const services = useServices();
  return useQuery({
    queryKey: ['presence', 'feed'],
    queryFn: () => services.presence.getLatestPosts(),
  });
}

export function useSharePresence() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      imageUri: string;
      caption?: string;
      mood?: string;
      locationLabel?: string;
    }) => services.presence.sharePost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useReactToPost() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => services.presence.reactToPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['presence', 'feed'] });
      const previous = queryClient.getQueryData<PresencePost[]>(['presence', 'feed']);
      queryClient.setQueryData<PresencePost[]>(['presence', 'feed'], (old) => {
        if (!old) {
          return old;
        }
        return old.map((p) =>
          p.id === postId ? { ...p, reactionCount: p.reactionCount + 1 } : p,
        );
      });
      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['presence', 'feed'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence', 'feed'] });
    },
  });
}

export function useHabits(month: string) {
  const services = useServices();
  return useQuery({
    queryKey: ['habits', month],
    queryFn: () => services.habits.getHabitsForMonth(month),
  });
}

export function useToggleHabit(month: string) {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      services.habits.toggleHabitCompletion(habitId, date),
    onSuccess: (next) => {
      queryClient.setQueryData(['habits', month], next);
    },
  });
}

export function useTimeline(
  filter: 'all' | 'prompt' | 'photo' | 'gratitude' | 'milestone' = 'all',
) {
  const services = useServices();
  return useQuery({
    queryKey: ['timeline', filter],
    queryFn: () => services.timeline.listMemories(filter),
  });
}

export function useNotificationPreferences() {
  const services = useServices();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications', 'prefs'],
    queryFn: () => services.notificationPrefs.getPreferences(),
  });
  const mutation = useMutation({
    mutationFn: services.notificationPrefs.updatePreferences,
    onSuccess: (next) => {
      queryClient.setQueryData(['notifications', 'prefs'], next);
    },
  });
  return { query, mutation };
}

export function usePrivacySettings() {
  const services = useServices();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['userSettings', 'privacy'],
    queryFn: () => services.userSettings.getPrivacy(),
  });
  const mutation = useMutation({
    mutationFn: services.userSettings.updatePrivacy,
    onSuccess: (next) => {
      queryClient.setQueryData(['userSettings', 'privacy'], next);
    },
  });
  return { query, mutation };
}

export function useAppLock() {
  const services = useServices();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['userSettings', 'appLock'],
    queryFn: () => services.userSettings.getAppLock(),
  });
  const mutation = useMutation({
    mutationFn: services.userSettings.updateAppLock,
    onSuccess: (next) => {
      queryClient.setQueryData(['userSettings', 'appLock'], next);
    },
  });
  return { query, mutation };
}
