import type { PromptThread } from '@/types/domain';

export type DailyPromptCardState =
  | 'gated'
  | 'unanswered'
  | 'answeredWaiting'
  | 'unlocked'
  | 'completed';

export type StreakPreviewModel = {
  currentStreakDays: number;
  copyLine: string;
  /** When set, the card shows preview styling and a footnote. */
  disclaimer?: string;
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
): Exclude<DailyPromptCardState, 'gated'> {
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

/**
 * Home card state: the daily question stays visually locked until the user completes
 * their side of the morning wake habit for today (when not yet answered the prompt).
 */
export function deriveHomeDailyPromptState(
  thread: PromptThread,
  meId: string,
  partnerId: string,
  morningRitualDone: boolean,
): DailyPromptCardState {
  const base = deriveDailyPromptState(thread, meId, partnerId);
  if (base === 'unanswered' && !morningRitualDone) {
    return 'gated';
  }
  return base;
}

function buildDailyCopy(
  state: DailyPromptCardState,
  question: string,
  promptId: string,
  partnerFirstName: string,
): HomeFeedViewModel['daily'] {
  const kickerToday = 'Today';
  if (state === 'gated') {
    return {
      promptId,
      question: 'Your question unlocks after a quick morning check-in. Same small ritual, even when you are hours apart.',
      kicker: kickerToday,
      state: 'gated',
      statusLine:
        'A gentle nudge: tap below when you are up, then the daily question opens for you. No push yet—this is a reminder-friendly preview.',
      ctaLabel: 'Morning check-in',
    };
  }
  const base = { promptId, question, kicker: kickerToday };
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

function buildLiveStreakCard(partnerFirstName: string, currentStreakDays: number): StreakPreviewModel {
  return {
    currentStreakDays,
    copyLine: `You and ${partnerFirstName} add a day when you both finish the prompt, you both share a photo that day, or you are together on a reunion (those days count automatically).`,
    disclaimer: undefined,
  };
}

type ComposeInput = {
  thread: PromptThread;
  meId: string;
  partnerId: string;
  partnerFirstName: string;
  /** User has completed their side of the morning wake habit for today. */
  morningRitualDone: boolean;
  /** From `getHomeEngagementStreak` / mock equivalent. */
  currentStreakDays: number;
};

/**
 * Composes a view model for the Home feed from a prompt thread and identity.
 */
export function composeHomeFeed(input: ComposeInput): HomeFeedViewModel {
  const { thread, meId, partnerId, partnerFirstName, morningRitualDone, currentStreakDays } = input;
  const state = deriveHomeDailyPromptState(thread, meId, partnerId, morningRitualDone);
  return {
    daily: buildDailyCopy(state, thread.question, thread.promptId, partnerFirstName),
    streak: buildLiveStreakCard(partnerFirstName, currentStreakDays),
  };
}
