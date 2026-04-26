import type {
  AppLockSettings,
  CoupleProfile,
  DeepLinkRef,
  Habit,
  MemoryItem,
  NotificationPrefs,
  PrivacySettings,
  PresencePost,
  PromptThread,
  Session,
} from '@/types/domain';

export type SignInInput = { email: string; password: string };
export type SignUpInput = { email: string; password: string; firstName: string };
export type UpdateProfileInput = { firstName?: string; displayName?: string };

export type AuthService = {
  getSession(): Promise<Session | null>;
  signIn(input: SignInInput): Promise<Session>;
  signUp(input: SignUpInput): Promise<Session>;
  updateProfile(partial: UpdateProfileInput): Promise<Session>;
  signOut(): Promise<void>;
};

/** Replaced by a Supabase-backed implementation that writes `couples` and validates invite rows. */
export type CoupleService = {
  getCouple(): Promise<CoupleProfile | null>;
  /** Returns a shareable URL; mock uses `lovedistance://invite/<token>`. */
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

/** Device-local preferences; mock uses `mockDb`; later replace with profile metadata + encrypted prefs. */
export type UserSettingsService = {
  getPrivacy(): Promise<PrivacySettings>;
  updatePrivacy(partial: Partial<PrivacySettings>): Promise<PrivacySettings>;
  getAppLock(): Promise<AppLockSettings>;
  updateAppLock(partial: Partial<AppLockSettings>): Promise<AppLockSettings>;
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
  userSettings: UserSettingsService;
  deepLinks: DeepLinkService;
};
