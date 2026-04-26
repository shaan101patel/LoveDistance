import type {
  AppLockSettings,
  CoupleProfile,
  Habit,
  MemoryItem,
  NotificationInboxItem,
  NotificationPrefs,
  PresencePost,
  PrivacySettings,
  PromptThread,
  PromptThreadActivity,
  RitualSignalEntry,
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
    id: 'habit-ours-both',
    title: 'Morning wake-up check-in (both do it)',
    type: 'ours',
    completionPolicy: 'both_required',
    goal: { kind: 'weekly_completions', targetCount: 5 },
    completionsByDate: {
      '2026-01-10': [mockMe.id, mockPartner.id],
      '2026-01-11': [mockMe.id, mockPartner.id],
    },
  },
  {
    id: 'habit-ours-either',
    title: 'Share one photo from the day (either of us)',
    type: 'ours',
    completionPolicy: 'either_partner',
    completionsByDate: {
      '2026-01-12': [mockMe.id],
    },
  },
  {
    id: 'habit-mine',
    title: 'Send one thoughtful message',
    type: 'mine',
    completionPolicy: 'either_partner',
    completionsByDate: {
      '2026-01-11': [mockMe.id],
      '2026-01-12': [mockMe.id],
    },
  },
  {
    id: 'habit-yours',
    title: 'Partner: stretch for 5 minutes',
    type: 'yours',
    completionPolicy: 'either_partner',
    goal: { kind: 'streak_target', targetDays: 7 },
    completionsByDate: {
      '2026-01-10': [mockPartner.id],
    },
  },
];

export const initialMemories: MemoryItem[] = [
  {
    id: 'memory-milestone-1',
    type: 'milestone',
    milestoneKind: 'anniversary',
    title: '100 days together in the LDR',
    summary: "Quiet dinner over video. You said you'd do it all again.",
    createdAt: '2025-12-20T20:00:00.000Z',
    deepLinkRef: 'memory:milestone-100d',
    isFavorite: true,
  },
  {
    id: 'memory-gratitude-1',
    type: 'gratitude',
    title: 'Gratitude: small kindness',
    summary: "Thank you for sending that playlist when I couldn't sleep.",
    createdAt: '2025-12-10T11:30:00.000Z',
    deepLinkRef: 'memory:grat-dec-10',
    isFavorite: true,
  },
  {
    id: 'memory-1',
    type: 'prompt',
    title: 'First unlocked daily prompt',
    summary: 'You both answered and reacted with hearts.',
    createdAt: '2025-12-05T19:00:00.000Z',
    deepLinkRef: 'prompt:prompt-today',
    isFavorite: true,
  },
  {
    id: 'memory-2',
    type: 'photo',
    title: 'Late-night photo drop',
    summary: 'Shared from the station before bed.',
    createdAt: '2025-12-03T22:15:00.000Z',
    deepLinkRef: 'photo:photo-1',
    isFavorite: false,
    imageUri: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6991?w=600',
  },
  {
    id: 'memory-photo-2',
    type: 'photo',
    title: 'Coffee in the old neighborhood',
    summary: "Sent from the corner cafe — next time we split a pastry in person.",
    createdAt: '2025-11-18T15:40:00.000Z',
    deepLinkRef: 'memory:photo-legacy-2',
    isFavorite: false,
    imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
  },
  {
    id: 'memory-prompt-archive',
    type: 'prompt',
    title: "What's one place you want to show me first when we visit?",
    summary: 'The river walk at dusk — long answer saved in your thread.',
    createdAt: '2025-11-01T12:00:00.000Z',
    deepLinkRef: 'memory:prompt-nov-1',
    isFavorite: false,
  },
  {
    id: 'memory-gratitude-2',
    type: 'gratitude',
    title: 'Gratitude: the voice note',
    summary: 'Hearing you laugh at the end of the day fixed everything.',
    createdAt: '2025-10-22T08:00:00.000Z',
    deepLinkRef: 'memory:grat-oct-22',
    isFavorite: false,
  },
  {
    id: 'memory-milestone-2',
    type: 'milestone',
    milestoneKind: 'notable',
    title: 'First time meeting in the new city',
    summary: "Train station hug. You were wearing the scarf I mailed you.",
    createdAt: '2025-09-14T14:30:00.000Z',
    deepLinkRef: 'memory:meet-new-city',
    isFavorite: true,
  },
  {
    id: 'memory-milestone-trip',
    type: 'milestone',
    milestoneKind: 'trip',
    title: 'Weekend in the mountains',
    summary: 'Hiked the ridge trail, shared thermos coffee at sunrise.',
    createdAt: '2025-08-02T10:00:00.000Z',
    deepLinkRef: 'memory:mountain-weekend',
    isFavorite: false,
    imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  {
    id: 'memory-milestone-streak',
    type: 'milestone',
    milestoneKind: 'streak_win',
    title: '30-day check-in streak',
    summary: "You both kept the 'goodnight call' habit for a full month.",
    createdAt: '2025-07-15T19:00:00.000Z',
    deepLinkRef: 'memory:streak-30d',
    isFavorite: false,
  },
];

export const initialPrefs: NotificationPrefs = {
  unansweredPrompt: true,
  newPhoto: true,
  habitReminder: true,
  milestones: true,
  reactions: true,
  anniversaries: true,
  countdownUpdates: true,
};

/** Seeded inbox for notification center (mock). */
export const initialNotificationInbox: NotificationInboxItem[] = [
  {
    id: 'n-prompt-1',
    category: 'prompt',
    title: 'Daily prompt waiting',
    summary: "Today's question is ready for you both.",
    createdAt: '2026-04-26T08:00:00.000Z',
    read: false,
    href: '/(app)/prompt/prompt-today',
  },
  {
    id: 'n-photo-1',
    category: 'photo',
    title: 'New photo from Partner',
    summary: 'Sunset walk, thinking of you.',
    createdAt: '2026-04-26T07:30:00.000Z',
    read: false,
    href: '/(app)/(tabs)/photos',
  },
  {
    id: 'n-react-1',
    category: 'reaction',
    title: 'Partner reacted to your answer',
    summary: 'They sent a heart on today’s prompt thread.',
    createdAt: '2026-04-25T22:15:00.000Z',
    read: true,
    href: '/(app)/prompt/prompt-today',
  },
  {
    id: 'n-habit-1',
    category: 'habit',
    title: 'Morning check-in reminder',
    summary: 'Shared wake-up habit: tap when you are up.',
    createdAt: '2026-04-25T14:00:00.000Z',
    read: false,
    href: '/(app)/wake-check-in',
  },
  {
    id: 'n-anniv-1',
    category: 'anniversary',
    title: 'Anniversary next week',
    summary: 'Your relationship anniversary is in 7 days.',
    createdAt: '2026-04-24T10:00:00.000Z',
    read: true,
    href: '/(app)/(tabs)/timeline',
  },
  {
    id: 'n-mile-1',
    category: 'anniversary',
    title: 'Milestone saved',
    summary: 'A new memory was added to your timeline.',
    createdAt: '2026-04-23T18:00:00.000Z',
    read: true,
    href: '/(app)/(tabs)/timeline',
  },
  {
    id: 'n-count-1',
    category: 'countdown',
    title: 'Reunion countdown',
    summary: '42 days until your next visit (sample).',
    createdAt: '2026-04-22T09:00:00.000Z',
    read: false,
    href: '/(app)/(tabs)/home',
  },
  {
    id: 'n-habit-2',
    category: 'habit',
    title: 'Weekly habit goal',
    summary: 'You are 3 of 5 days on a shared habit this week.',
    createdAt: '2026-04-21T12:00:00.000Z',
    read: true,
    href: '/(app)/(tabs)/calendar',
  },
];

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

export const initialRitualSignals: RitualSignalEntry[] = [];

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
  ritualSignals: RitualSignalEntry[];
  notificationInbox: NotificationInboxItem[];
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
  ritualSignals: [...initialRitualSignals],
  notificationInbox: initialNotificationInbox.map((n) => ({ ...n })),
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
