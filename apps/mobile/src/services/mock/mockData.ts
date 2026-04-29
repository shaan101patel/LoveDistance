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
  RelationshipDashboardSnapshot,
  RitualSignalEntry,
  Session,
  SubscriptionState,
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
  timeZone: 'Europe/London',
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

/**
 * Presence feed seed including Mon–Sun 2026-04-20…2026-04-26 (UTC-stable timestamps) for weekly recap
 * selection, plus one out-of-week post to verify filtering.
 */
export const initialPresencePosts: PresencePost[] = [
  {
    id: 'photo-recap-mon',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6991?w=600',
    caption: 'Monday: quiet coffee before the week spun up.',
    mood: 'soft',
    locationLabel: 'Austin, TX (sample)',
    createdAt: '2026-04-20T17:00:00.000Z',
    reactionCount: 1,
  },
  {
    id: 'photo-recap-tue',
    authorId: mockMe.id,
    imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    caption: 'Tuesday: the corner cafe you always mention.',
    mood: 'warm',
    createdAt: '2026-04-21T17:00:00.000Z',
    reactionCount: 0,
  },
  {
    id: 'photo-recap-wed',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    caption: 'Wednesday: sky looked like your last voice note.',
    mood: 'soft',
    createdAt: '2026-04-22T17:00:00.000Z',
    reactionCount: 2,
  },
  {
    id: 'photo-recap-thu',
    authorId: mockMe.id,
    imageUri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    caption: 'Thursday: train window blur, heading home late.',
    createdAt: '2026-04-23T17:00:00.000Z',
    reactionCount: 0,
  },
  {
    id: 'photo-recap-fri',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
    caption: 'Friday: takeout and a long call.',
    mood: 'cozy',
    createdAt: '2026-04-24T17:00:00.000Z',
    reactionCount: 3,
  },
  {
    id: 'photo-recap-sat',
    authorId: mockMe.id,
    imageUri: 'https://images.unsplash.com/photo-1529333166437-7750a6dd9a70?w=600',
    caption: 'Saturday: farmers market flowers for the desk.',
    createdAt: '2026-04-25T17:00:00.000Z',
    reactionCount: 1,
  },
  {
    id: 'photo-recap-sun',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600',
    caption: 'Sunday: golden hour on the balcony.',
    createdAt: '2026-04-26T17:00:00.000Z',
    reactionCount: 2,
  },
  {
    id: 'photo-out-of-week',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
    caption: 'Older moment — should not appear in this week’s recap picker.',
    createdAt: '2026-04-10T17:00:00.000Z',
    reactionCount: 0,
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

export const initialSubscription: SubscriptionState = {
  tier: 'free',
  renewsAtIso: null,
  source: 'mock',
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
  subscription: SubscriptionState;
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
  subscription: { ...initialSubscription },
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

/** Static couple “insights” for the emotional dashboard (mock only). */
export const mockRelationshipDashboardSnapshot: RelationshipDashboardSnapshot = {
  generatedAt: '2026-01-15T12:00:00.000Z',
  headline: 'You two have been showing up for each other—gently, often, and in your own rhythm.',
  promptRhythm: {
    insight:
      'Most weeks you both touched the daily prompt, even on busy days. That steadiness matters more than a perfect streak.',
    weeks: [
      { weekLabel: 'Nov 1', bothEngagedScore: 0.72 },
      { weekLabel: 'Nov 2', bothEngagedScore: 0.85 },
      { weekLabel: 'Nov 3', bothEngagedScore: 0.68 },
      { weekLabel: 'Nov 4', bothEngagedScore: 0.9 },
      { weekLabel: 'Dec 1', bothEngagedScore: 0.78 },
      { weekLabel: 'Dec 2', bothEngagedScore: 0.82 },
      { weekLabel: 'Dec 3', bothEngagedScore: 0.88 },
      { weekLabel: 'Jan 1', bothEngagedScore: 0.91 },
    ],
  },
  gratitude: {
    insight:
      'Little notes of thanks kept appearing—small sentences that make the distance feel shorter.',
    weekLabels: ['Nov wk 1', 'Nov wk 2', 'Dec wk 1', 'Dec wk 2', 'Jan wk 1'],
    entriesPerWeek: [2, 4, 3, 5, 4],
  },
  favoriteCategories: {
    insight:
      'Your threads leaned toward tender, everyday moments—less “big announcements,” more “I’m thinking of you.”',
    items: [
      { label: 'Little joys', share: 0.28 },
      { label: 'Plans together', share: 0.24 },
      { label: 'Hard days & comfort', share: 0.2 },
      { label: 'Gratitude & appreciation', share: 0.18 },
      { label: 'Playful check-ins', share: 0.1 },
    ],
  },
  savedMemories: {
    insight:
      'You tucked away milestones and quiet wins alike—enough to scroll back on a tough night and feel held.',
    totalCount: 24,
    highlights: [
      {
        id: 'memory-milestone-1',
        title: '100 days together in the LDR',
        savedAtLabel: 'Dec 2025',
      },
      {
        id: 'memory-gratitude-1',
        title: 'Gratitude: small kindness',
        savedAtLabel: 'Dec 2025',
      },
      {
        id: 'memory-1',
        title: 'First unlocked daily prompt',
        savedAtLabel: 'Dec 2025',
      },
    ],
  },
};
