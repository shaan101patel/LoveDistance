import type { PromptAnswer, PromptThread, PromptThreadCategory } from '@/types/domain';

export type PartnerRowModel =
  | { kind: 'waiting'; partnerFirstName: string }
  | { kind: 'obscured' }
  | { kind: 'visible'; text: string; submittedAt: string };

export type PromptThreadViewModel =
  | {
      phase: 'awaitingMyAnswer';
      promptId: string;
      question: string;
      category: PromptThreadCategory | undefined;
      myAnswer: null;
      partnerRow: PartnerRowModel;
    }
  | {
      phase: 'awaitingPartner';
      promptId: string;
      question: string;
      category: PromptThreadCategory | undefined;
      myAnswer: PromptAnswer;
      partnerRow: PartnerRowModel;
    }
  | {
      phase: 'unlocked';
      promptId: string;
      question: string;
      category: PromptThreadCategory | undefined;
      myAnswer: PromptAnswer;
      partnerAnswer: PromptAnswer;
    };

function getAnswerFor(thread: PromptThread, userId: string): PromptAnswer | null {
  return thread.answers.find((a) => a.userId === userId) ?? null;
}

/** Partner text should not be readable until the thread is revealed. */
export function shouldObscurePartnerAnswer(thread: PromptThread, partnerId: string): boolean {
  if (thread.isRevealed) {
    return false;
  }
  return getAnswerFor(thread, partnerId) != null;
}

function buildPartnerRow(
  thread: PromptThread,
  partnerId: string,
  partnerFirstName: string,
): PartnerRowModel {
  const pAns = getAnswerFor(thread, partnerId);
  if (thread.isRevealed && pAns) {
    return {
      kind: 'visible',
      text: pAns.answer,
      submittedAt: pAns.submittedAt,
    };
  }
  if (pAns && !thread.isRevealed) {
    return { kind: 'obscured' };
  }
  return { kind: 'waiting', partnerFirstName };
}

type BuildInput = {
  thread: PromptThread;
  meId: string;
  partnerId: string;
  partnerFirstName: string;
};

/**
 * UI-facing state for the prompt thread. All reveal rules derive from
 * `thread.answers` and `thread.isRevealed` (kept in sync with `getIsPromptRevealed`).
 */
export function buildPromptThreadViewModel(input: BuildInput): PromptThreadViewModel {
  const { thread, meId, partnerId, partnerFirstName } = input;
  const myAnswer = getAnswerFor(thread, meId);
  const partnerAnswer = getAnswerFor(thread, partnerId);
  const { promptId, question, category, isRevealed } = thread;

  if (isRevealed && myAnswer && partnerAnswer) {
    return {
      phase: 'unlocked',
      promptId,
      question,
      category,
      myAnswer,
      partnerAnswer,
    };
  }

  if (!myAnswer) {
    return {
      phase: 'awaitingMyAnswer',
      promptId,
      question,
      category,
      myAnswer: null,
      partnerRow: buildPartnerRow(thread, partnerId, partnerFirstName),
    };
  }

  return {
    phase: 'awaitingPartner',
    promptId,
    question,
    category,
    myAnswer,
    partnerRow: buildPartnerRow(thread, partnerId, partnerFirstName),
  };
}
