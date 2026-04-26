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
  PromptThreadActivity,
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

export type SubmitPromptAnswerInput = { answer: string; imageUri: string | null };

export type PromptService = {
  getTodayPrompt(): Promise<PromptThread>;
  /** Thread screen read path; return null if no prompt with this id. */
  getPromptById(promptId: string): Promise<PromptThread | null>;
  submitPromptAnswer(promptId: string, input: SubmitPromptAnswerInput): Promise<PromptThread>;
  reactToPrompt(promptId: string, emoji: string): Promise<PromptThread>;
};

export type FollowUpSuggestionService = {
  suggestForReceivedPhoto(input: {
    imageUri: string;
    promptQuestion: string;
    partnerName?: string;
  }): Promise<string[]>;
};

export type AddThreadReplyInput = {
  promptId: string;
  body: string;
  parentReplyId?: string | null;
};

export type ReactToThreadReplyInput = {
  promptId: string;
  replyId: string;
  emoji: string;
};

/** Follow-ups, per-reply reactions, and voice placeholders—separate from daily `PromptThread` payload. */
export type ThreadInteractionService = {
  getThreadActivity(promptId: string): Promise<PromptThreadActivity | null>;
  addThreadReply(input: AddThreadReplyInput): Promise<PromptThreadActivity>;
  reactToThreadReply(input: ReactToThreadReplyInput): Promise<PromptThreadActivity>;
};

export type PresenceService = {
  getLatestPosts(): Promise<PresencePost[]>;
  sharePost(input: {
    imageUri: string;
    caption?: string;
    mood?: string;
    locationLabel?: string;
  }): Promise<PresencePost>;
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
  threadInteraction: ThreadInteractionService;
  presence: PresenceService;
  habits: HabitService;
  timeline: TimelineService;
  followUpSuggestions: FollowUpSuggestionService;
  notificationPrefs: NotificationPrefsService;
  userSettings: UserSettingsService;
  deepLinks: DeepLinkService;
};
