import type {
  CoupleProfile,
  Habit,
  MemoryItem,
  NotificationPrefs,
  PresencePost,
  PromptThread,
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
  answers: [],
  isRevealed: false,
  reactions: [],
};

export const initialPresencePosts: PresencePost[] = [
  {
    id: 'photo-1',
    authorId: mockPartner.id,
    imageUri: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6991?w=600',
    caption: 'Sunset walk, thinking of you.',
    mood: 'soft',
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

type MockDatabase = {
  session: Session | null;
  couple: CoupleProfile | null;
  prompt: PromptThread;
  posts: PresencePost[];
  habits: Habit[];
  memories: MemoryItem[];
  prefs: NotificationPrefs;
};

export const mockDb: MockDatabase = {
  session: null,
  couple: null,
  prompt: initialPromptThread,
  posts: initialPresencePosts,
  habits: initialHabits,
  memories: initialMemories,
  prefs: initialPrefs,
};

export function refreshRevealState() {
  mockDb.prompt.isRevealed = getIsPromptRevealed(mockDb.prompt.answers);
}
