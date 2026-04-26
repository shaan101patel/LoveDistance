import type {
  AppLockSettings,
  CoupleProfile,
  Habit,
  MemoryItem,
  NotificationPrefs,
  PresencePost,
  PrivacySettings,
  PromptThread,
  PromptThreadActivity,
  Session,
  UserProfile,
} from '@/types/domain';
import { getIsPromptRevealed } from '@/features/prompts/revealLogic';

export const mockMe: UserProfile = {
  id: 'user-me',
  firstName: 'You',
};

export const mockPartner: UserProfile = {
  id: 'user-partner',
  firstName: 'Partner',
};

export const initialPromptThread: PromptThread = {
  promptId: 'prompt-today',
  date: new Date().toISOString().slice(0, 10),
  question: 'What small moment made you feel close to me this week?',
  category: { id: 'cat-connection', label: 'Connection' },
  answers: [],
  isRevealed: false,
  reactions: [],
};

export const initialThreadActivity: PromptThreadActivity = {
  promptId: 'prompt-today',
  replies: [
    {
      id: 'reply-seed-1',
      promptId: 'prompt-today',
      parentReplyId: null,
      authorId: mockPartner.id,
      body: "Can't wait to hear your side too.",
      createdAt: new Date().toISOString(),
      reactions: [],
    },
  ],
  voiceNotePlaceholders: [
    {
      id: 'vn-placeholder-1',
      promptId: 'prompt-today',
      kind: 'placeholder',
      label: 'Leave a short voice follow-up',
    },
  ],
};

export function cloneThreadActivity(source: PromptThreadActivity): PromptThreadActivity {
  return {
    ...source,
    replies: source.replies.map((r) => ({ ...r, reactions: r.reactions.map((x) => ({ ...x })) })),
    voiceNotePlaceholders: source.voiceNotePlaceholders.map((v) => ({ ...v })),
  };
}

export function resetThreadActivityToInitial() {
  mockDb.threadActivity = cloneThreadActivity(initialThreadActivity);
}

export const initialPresencePosts: PresencePost[] = [
  {
    id: 'photo-1',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6991?w=600',
    caption: 'Sunset walk, thinking of you.',
    mood: 'soft',
    locationLabel: 'Austin, TX (sample)',
    createdAt: new Date().toISOString(),
    reactionCount: 2,
  },
];

export const initialHabits: Habit[] = [
  {
    id: 'habit-ours-check-in',
    title: 'Morning wake-up check-in',
    type: 'ours',
    requiresBothPartners: true,
    completionsByDate: {},
  },
  {
    id: 'habit-mine-message',
    title: 'Send one thoughtful message',
    type: 'mine',
    requiresBothPartners: false,
    completionsByDate: {},
  },
];

export const initialMemories: MemoryItem[] = [
  {
    id: 'memory-1',
    type: 'prompt',
    title: 'First unlocked daily prompt',
    summary: 'You both answered and reacted with hearts.',
    createdAt: new Date().toISOString(),
    deepLinkRef: 'prompt:prompt-today',
    isFavorite: true,
  },
  {
    id: 'memory-2',
    type: 'photo',
    title: 'Late-night photo drop',
    summary: 'Shared from the station before bed.',
    createdAt: new Date().toISOString(),
    deepLinkRef: 'photo:photo-1',
    isFavorite: false,
  },
];

export const initialPrefs: NotificationPrefs = {
  unansweredPrompt: true,
  newPhoto: true,
  habitReminder: true,
  milestones: true,
};

export const initialPrivacy: PrivacySettings = {
  sharePresence: true,
  productAnalytics: false,
  redactPreviews: true,
};

export const initialAppLock: AppLockSettings = {
  requirePasscode: false,
  useBiometric: false,
  isPasscodeSet: false,
};

/** Issued invite token from createInviteLink; acceptInvite must match (mock-only). */
export type MockInviteLedger = {
  issuedToken: string | null;
  redeemedTokens: string[];
};

type MockDatabase = {
  session: Session | null;
  couple: CoupleProfile | null;
  invite: MockInviteLedger;
  prompt: PromptThread;
  /** Follow-up replies and voice placeholders; not merged into `prompt`. */
  threadActivity: PromptThreadActivity;
  posts: PresencePost[];
  habits: Habit[];
  memories: MemoryItem[];
  prefs: NotificationPrefs;
  privacy: PrivacySettings;
  appLock: AppLockSettings;
};

export const mockDb: MockDatabase = {
  session: null,
  couple: null,
  invite: { issuedToken: null, redeemedTokens: [] },
  prompt: initialPromptThread,
  threadActivity: cloneThreadActivity(initialThreadActivity),
  posts: initialPresencePosts,
  habits: initialHabits,
  memories: initialMemories,
  prefs: initialPrefs,
  privacy: { ...initialPrivacy },
  appLock: { ...initialAppLock },
};

export function refreshRevealState() {
  mockDb.prompt.isRevealed = getIsPromptRevealed(mockDb.prompt.answers);
}

/**
 * When any answer includes a photo, keep a single fused `MemoryItem` for the timeline; otherwise remove it.
 */
export function upsertPromptPhotoFusionMemory(): void {
  const t = mockDb.prompt;
  const fusionId = `memory-fusion-${t.promptId}`;
  mockDb.memories = mockDb.memories.filter((m) => m.id !== fusionId);
  const withPhoto = [...t.answers]
    .filter((a) => a.imageUri)
    .sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];
  if (!withPhoto) {
    return;
  }
  const title = t.question.length > 60 ? `${t.question.slice(0, 57)}…` : t.question;
  const summary =
    withPhoto.answer.length > 120 ? `${withPhoto.answer.slice(0, 117)}…` : withPhoto.answer;
  const row: MemoryItem = {
    id: fusionId,
    type: 'prompt',
    title,
    summary,
    createdAt: withPhoto.submittedAt,
    deepLinkRef: `prompt:${t.promptId}`,
    isFavorite: false,
    imageUri: withPhoto.imageUri!,
  };
  mockDb.memories = [row, ...mockDb.memories];
}
