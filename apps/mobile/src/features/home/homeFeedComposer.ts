import type { PromptThread } from '@/types/domain';

export type DailyPromptCardState =
  | 'unanswered'
  | 'answeredWaiting'
  | 'unlocked'
  | 'completed';

export type PartnerActivityRow = {
  id: string;
  faIcon: 'heart' | 'image' | 'comment';
  title: string;
  subtitle: string;
};

export type StreakPreviewModel = {
  currentStreakDays: number;
  copyLine: string;
  disclaimer: string;
};

export type HomeFeedViewModel = {
  daily: {
    state: DailyPromptCardState;
    promptId: string;
    question: string;
    kicker: string;
    statusLine: string;
    ctaLabel: string;
  };
  partnerActivity: { heading: string; rows: PartnerActivityRow[] };
  streak: StreakPreviewModel;
};

function hasUserAnswered(thread: PromptThread, userId: string): boolean {
  return thread.answers.some((a) => a.userId === userId);
}

function hasUserReacted(thread: PromptThread, userId: string): boolean {
  return thread.reactions.some((r) => r.userId === userId);
}

export function deriveDailyPromptState(
  thread: PromptThread,
  meId: string,
  partnerId: string,
): DailyPromptCardState {
  const iAnswered = hasUserAnswered(thread, meId);
  if (!iAnswered) {
    return 'unanswered';
  }
  if (!thread.isRevealed) {
    return 'answeredWaiting';
  }
  const bothReacted = hasUserReacted(thread, meId) && hasUserReacted(thread, partnerId);
  if (bothReacted) {
    return 'completed';
  }
  return 'unlocked';
}

function buildDailyCopy(
  state: DailyPromptCardState,
  question: string,
  promptId: string,
  partnerFirstName: string,
): HomeFeedViewModel['daily'] {
  const kicker = 'Today';
  const base = { promptId, question, kicker };
  switch (state) {
    case 'unanswered':
      return {
        ...base,
        state,
        statusLine: 'A fresh question for just the two of you.',
        ctaLabel: 'Answer',
      };
    case 'answeredWaiting':
      return {
        ...base,
        state,
        statusLine: `You answered. When ${partnerFirstName} adds theirs, you can read together.`,
        ctaLabel: 'View your answer',
      };
    case 'unlocked':
      return {
        ...base,
        state,
        statusLine: 'You both answered—read each other in the thread.',
        ctaLabel: 'View thread',
      };
    case 'completed':
      return {
        ...base,
        state,
        statusLine: 'You both chimed in—tomorrow brings a new question.',
        ctaLabel: 'View thread',
      };
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function buildPlaceholderActivity(partnerFirstName: string): HomeFeedViewModel['partnerActivity'] {
  return {
    heading: 'Partner activity (sample)',
    rows: [
      {
        id: 'checkin',
        faIcon: 'comment',
        title: `${partnerFirstName} · last check-in (sample)`,
        subtitle: '“Thinking of you this morning.”',
      },
      {
        id: 'prompt',
        faIcon: 'heart',
        title: 'Streaks build here (sample)',
        subtitle: 'You both answered 3 of 5 recent prompts',
      },
    ],
  };
}

function buildStreakPreview(): StreakPreviewModel {
  return {
    currentStreakDays: 7,
    copyLine: 'When you both answer the daily prompt, your streak can grow. Preview data only.',
    disclaimer: 'Streaks will sync for real when your backend is connected.',
  };
}

type ComposeInput = {
  thread: PromptThread;
  meId: string;
  partnerId: string;
  partnerFirstName: string;
};

/**
 * Composes a view model for the Home feed from a prompt thread and identity.
 * Replace placeholder activity/streak from this result when you wire real APIs.
 */
export function composeHomeFeed(input: ComposeInput): HomeFeedViewModel {
  const { thread, meId, partnerId, partnerFirstName } = input;
  const state = deriveDailyPromptState(thread, meId, partnerId);
  return {
    daily: buildDailyCopy(state, thread.question, thread.promptId, partnerFirstName),
    partnerActivity: buildPlaceholderActivity(partnerFirstName),
    streak: buildStreakPreview(),
  };
}
