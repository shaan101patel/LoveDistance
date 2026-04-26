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
};

export type PromptThread = {
  promptId: string;
  date: string;
  question: string;
  answers: PromptAnswer[];
  isRevealed: boolean;
  reactions: { id: string; userId: string; emoji: string }[];
};

export type PresencePost = {
  id: string;
  authorId: string;
  imageUri: string;
  caption?: string;
  mood?: string;
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
