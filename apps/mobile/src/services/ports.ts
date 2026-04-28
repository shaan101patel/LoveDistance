import type {
  AppLockSettings,
  CoupleProfile,
  DeepLinkRef,
  Habit,
  MemoryItem,
  NotificationInboxItem,
  NotificationPrefs,
  RelationshipDashboardSnapshot,
  RitualSignalEntry,
  RitualSignalKind,
  SubscriptionState,
  SubscriptionTier,
  TimelineMemoryFilter,
  PrivacySettings,
  PresencePost,
  PromptThread,
  PromptThreadActivity,
  Session,
  WeeklyRecapDraft,
} from '@/types/domain';

export type SignInInput = { email: string; password: string };
export type SignUpInput = { email: string; password: string; firstName: string };
export type UpdateProfileInput = { firstName?: string; displayName?: string };

export type AuthService = {
  getSession(): Promise<Session | null>;
  signIn(input: SignInInput): Promise<Session>;
  signUp(input: SignUpInput): Promise<Session>;
  updateProfile(partial: UpdateProfileInput): Promise<Session>;
  /** Pick a photo from the library; uploads to storage and updates profile (mock stores local URI). */
  uploadProfilePhoto(localUri: string, contentType?: string): Promise<Session>;
  signOut(): Promise<void>;
};

/** Replaced by a Supabase-backed implementation that writes `couples` and validates invite rows. */
export type UpdateReunionDatesInput = {
  reunionDate: string | null;
  reunionEndDate: string | null;
};

export type CoupleService = {
  getCouple(): Promise<CoupleProfile | null>;
  /** Returns a shareable URL; mock uses `lovedistance://invite/<token>`. */
  createInviteLink(): Promise<string>;
  acceptInvite(token: string): Promise<CoupleProfile>;
  /** Persist reunion window (`reunion_date` / `reunion_end_date` on `couples`). */
  updateReunionDates(input: UpdateReunionDatesInput): Promise<CoupleProfile>;
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
  /** `monthKey` is `YYYY-MM` for a future month-scoped API; mock may return all habits. */
  getHabitsForMonth(monthKey: string): Promise<Habit[]>;
  getHabitById(habitId: string): Promise<Habit | null>;
  toggleHabitCompletion(habitId: string, date: string): Promise<Habit[]>;
};

export type RitualsService = {
  logRitualSignal(kind: RitualSignalKind, body: string): Promise<RitualSignalEntry[]>;
  listRecentRitualSignals(limit: number): Promise<RitualSignalEntry[]>;
};

export type TimelineService = {
  listMemories(filter?: TimelineMemoryFilter): Promise<MemoryItem[]>;
  getMemoryById(memoryId: string): Promise<MemoryItem | null>;
  setMemoryFavorite(memoryId: string, isFavorite: boolean): Promise<MemoryItem>;
};

export type NotificationPrefsService = {
  getPreferences(): Promise<NotificationPrefs>;
  updatePreferences(prefs: Partial<NotificationPrefs>): Promise<NotificationPrefs>;
};

export type NotificationInboxService = {
  listInbox(limit?: number): Promise<NotificationInboxItem[]>;
  markRead(ids: string[]): Promise<NotificationInboxItem[]>;
  markAllRead(): Promise<NotificationInboxItem[]>;
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

/** Couple-level insights; mock returns a static snapshot until a real analytics backend exists. */
export type RelationshipDashboardService = {
  getSnapshot(): Promise<RelationshipDashboardSnapshot>;
};

export type WeeklyRecapService = {
  listPhotoCandidatesForWeek(anchorIso: string): Promise<PresencePost[]>;
  /** Mock: placeholder highlights. Later: LLM-backed ranking from selected ids + week context. */
  buildRecapDraft(input: {
    weekStartYmd: string;
    selectedPhotoIds: string[];
  }): Promise<WeeklyRecapDraft>;
};

export type SubscriptionService = {
  getSubscription(): Promise<SubscriptionState>;
  /** Mock-only QA hook; omit in store-backed implementations. */
  setMockTier?(tier: SubscriptionTier): Promise<SubscriptionState>;
};

export type ServiceRegistry = {
  auth: AuthService;
  couple: CoupleService;
  prompt: PromptService;
  threadInteraction: ThreadInteractionService;
  presence: PresenceService;
  habits: HabitService;
  rituals: RitualsService;
  timeline: TimelineService;
  followUpSuggestions: FollowUpSuggestionService;
  notificationPrefs: NotificationPrefsService;
  notificationInbox: NotificationInboxService;
  userSettings: UserSettingsService;
  deepLinks: DeepLinkService;
  relationshipDashboard: RelationshipDashboardService;
  weeklyRecap: WeeklyRecapService;
  subscription: SubscriptionService;
};
