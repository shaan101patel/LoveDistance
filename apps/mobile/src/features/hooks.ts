import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/services/ServiceContext';
import type { CoupleProfile } from '@/types/domain';

/** Couple space for the signed-in user; null when unpaired. Invalidated after pairing / sign-out flows. */
export function useCouple() {
  const services = useServices();
  return useQuery({
    queryKey: ['couple'],
    queryFn: (): Promise<CoupleProfile | null> => services.couple.getCouple(),
  });
}

export function useTodayPrompt() {
  const services = useServices();
  return useQuery({
    queryKey: ['prompt', 'today'],
    queryFn: () => services.prompt.getTodayPrompt(),
  });
}

export function useSubmitPrompt() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, answer }: { promptId: string; answer: string }) =>
      services.prompt.submitPromptAnswer(promptId, answer),
    onSuccess: (next) => {
      queryClient.setQueryData(['prompt', 'today'], next);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function usePromptReaction() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, emoji }: { promptId: string; emoji: string }) =>
      services.prompt.reactToPrompt(promptId, emoji),
    onSuccess: (next) => {
      queryClient.setQueryData(['prompt', 'today'], next);
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
    mutationFn: (input: { imageUri: string; caption?: string; mood?: string }) =>
      services.presence.sharePost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
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
