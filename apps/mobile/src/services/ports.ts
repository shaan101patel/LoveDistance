import type {
  CoupleProfile,
  DeepLinkRef,
  Habit,
  MemoryItem,
  NotificationPrefs,
  PresencePost,
  PromptThread,
  Session,
} from '@/types/domain';

export type AuthService = {
  getSession(): Promise<Session | null>;
  signIn(firstName: string): Promise<Session>;
  signOut(): Promise<void>;
};

export type CoupleService = {
  getCouple(): Promise<CoupleProfile | null>;
  createInviteLink(): Promise<string>;
  acceptInvite(token: string): Promise<CoupleProfile>;
};

export type PromptService = {
  getTodayPrompt(): Promise<PromptThread>;
  submitPromptAnswer(promptId: string, answer: string): Promise<PromptThread>;
  reactToPrompt(promptId: string, emoji: string): Promise<PromptThread>;
};

export type PresenceService = {
  getLatestPosts(): Promise<PresencePost[]>;
  sharePost(input: { imageUri: string; caption?: string; mood?: string }): Promise<PresencePost>;
  reactToPost(postId: string): Promise<void>;
};

export type HabitService = {
  getHabitsForMonth(month: string): Promise<Habit[]>;
  toggleHabitCompletion(habitId: string, date: string): Promise<Habit[]>;
};

export type TimelineService = {
  listMemories(filter?: MemoryItem['type'] | 'all'): Promise<MemoryItem[]>;
  getMemoryById(memoryId: string): Promise<MemoryItem | null>;
};

export type NotificationPrefsService = {
  getPreferences(): Promise<NotificationPrefs>;
  updatePreferences(prefs: Partial<NotificationPrefs>): Promise<NotificationPrefs>;
};

export type DeepLinkService = {
  parseUrl(url: string): DeepLinkRef | null;
  toPath(ref: DeepLinkRef): string;
};

export type ServiceRegistry = {
  auth: AuthService;
  couple: CoupleService;
  prompt: PromptService;
  presence: PresenceService;
  habits: HabitService;
  timeline: TimelineService;
  notificationPrefs: NotificationPrefsService;
  deepLinks: DeepLinkService;
};
