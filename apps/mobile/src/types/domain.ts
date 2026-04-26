export type UserProfile = {
  id: string;
  firstName: string;
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

export type AppTabName = 'home' | 'prompt' | 'photos' | 'calendar' | 'timeline' | 'settings';

export type DeepLinkRef =
  | { kind: 'tab'; name: AppTabName }
  | { kind: 'prompt'; id: string }
  | { kind: 'memory'; id: string }
  | { kind: 'photo'; id: string }
  | { kind: 'habit'; id: string }
  | { kind: 'invite'; token: string };
