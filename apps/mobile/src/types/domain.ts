export type UserProfile = {
  id: string;
  firstName: string;
  email?: string;
  displayName?: string;
};

export type Session = {
  user: UserProfile;
  signedInAt: string;
};

export type CoupleProfile = {
  id: string;
  meId: string;
  partner: UserProfile;
  reunionDate?: string;
};

export type PromptAnswer = {
  userId: string;
  answer: string;
  submittedAt: string;
  /** Optional local file URI or remote URL attached to the answer (mock + future upload). */
  imageUri?: string;
};

export type PromptThreadCategory = {
  id: string;
  label: string;
};

export type PromptThread = {
  promptId: string;
  date: string;
  question: string;
  /** Optional group label for UI (e.g. daily theme); future API can return this. */
  category?: PromptThreadCategory;
  answers: PromptAnswer[];
  isRevealed: boolean;
  reactions: { id: string; userId: string; emoji: string }[];
};

/** Reactions on a follow-up reply (separate from prompt-level `PromptThread.reactions`). */
export type ThreadReplyReaction = {
  id: string;
  userId: string;
  emoji: string;
};

/**
 * Post-unlock follow-up text; `parentReplyId` null = top-level under the prompt thread.
 * Kept separate from `PromptThread` / `PromptAnswer` for backend mapping.
 */
export type PromptThreadReply = {
  id: string;
  promptId: string;
  parentReplyId: string | null;
  authorId: string;
  body: string;
  createdAt: string;
  reactions: ThreadReplyReaction[];
};

/** UI-only slot until real recording and storage exist. */
export type VoiceNotePlaceholder = {
  id: string;
  promptId: string;
  kind: 'placeholder';
  label: string;
};

export type PromptThreadActivity = {
  promptId: string;
  replies: PromptThreadReply[];
  voiceNotePlaceholders: VoiceNotePlaceholder[];
};

export type PresencePost = {
  id: string;
  authorId: string;
  imageUri: string;
  caption?: string;
  mood?: string;
  /** Free-text place name (e.g. city), not a live GPS pin in mock mode. */
  locationLabel?: string;
  createdAt: string;
  reactionCount: number;
};

export type HabitType = 'mine' | 'yours' | 'ours';

export type Habit = {
  id: string;
  title: string;
  type: HabitType;
  requiresBothPartners: boolean;
  completionsByDate: Record<string, string[]>;
};

export type MemoryType = 'prompt' | 'photo' | 'gratitude' | 'milestone';

export type MemoryItem = {
  id: string;
  type: MemoryType;
  title: string;
  summary: string;
  createdAt: string;
  deepLinkRef: string;
  isFavorite: boolean;
  /** Timeline thumbnail (e.g. prompt answer with photo). */
  imageUri?: string;
};

export type NotificationPrefs = {
  unansweredPrompt: boolean;
  newPhoto: boolean;
  habitReminder: boolean;
  milestones: boolean;
};

/** Local-only privacy flags; a Supabase `profiles` row or `user_settings` would mirror this later. */
export type PrivacySettings = {
  sharePresence: boolean;
  productAnalytics: boolean;
  redactPreviews: boolean;
};

/**
 * App lock + biometrics: UI-only in mock mode (no Keychain, no local authentication).
 * Future native module would read/write `isPasscodeSet` and biometric enrollment.
 */
export type AppLockSettings = {
  requirePasscode: boolean;
  useBiometric: boolean;
  isPasscodeSet: boolean;
};

export type AppTabName = 'home' | 'prompt' | 'photos' | 'calendar' | 'timeline' | 'settings';

export type DeepLinkRef =
  | { kind: 'tab'; name: AppTabName }
  | { kind: 'prompt'; id: string }
  | { kind: 'memory'; id: string }
  | { kind: 'photo'; id: string }
  | { kind: 'habit'; id: string }
  | { kind: 'invite'; token: string };
