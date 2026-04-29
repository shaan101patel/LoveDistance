import { describe, expect, it } from 'vitest';

import {
  composeHomeFeed,
  deriveDailyPromptState,
  deriveHomeDailyPromptState,
} from '@/features/home/homeFeedComposer';
import type { PromptThread } from '@/types/domain';

const meId = 'user-me';
const partnerId = 'user-partner';

const baseThread = (): PromptThread => ({
  promptId: 'p1',
  date: '2026-01-15',
  question: 'What small moment made you feel close to me this week?',
  answers: [],
  isRevealed: false,
  reactions: [],
});

describe('deriveDailyPromptState', () => {
  it('unanswered when the current user has not answered', () => {
    const t = {
      ...baseThread(),
      answers: [{ userId: partnerId, answer: 'X', submittedAt: 't' }],
      isRevealed: true,
    };
    expect(deriveDailyPromptState(t, meId, partnerId)).toBe('unanswered');
  });

  it('answeredWaiting when the current user answered but the thread is not revealed', () => {
    const t: PromptThread = {
      ...baseThread(),
      answers: [{ userId: meId, answer: 'Y', submittedAt: 't' }],
      isRevealed: false,
    };
    expect(deriveDailyPromptState(t, meId, partnerId)).toBe('answeredWaiting');
  });

  it('unlocked when both answered but reactions are not complete from both', () => {
    const t: PromptThread = {
      ...baseThread(),
      answers: [
        { userId: meId, answer: 'A', submittedAt: 't1' },
        { userId: partnerId, answer: 'B', submittedAt: 't2' },
      ],
      isRevealed: true,
      reactions: [{ id: 'r1', userId: meId, emoji: '❤️' }],
    };
    expect(deriveDailyPromptState(t, meId, partnerId)).toBe('unlocked');
  });

  it('gated: unanswerd + !morningRitualDone', () => {
    const t = {
      ...baseThread(),
      answers: [{ userId: partnerId, answer: 'X', submittedAt: 't' }],
      isRevealed: true,
    };
    expect(deriveHomeDailyPromptState(t, meId, partnerId, false)).toBe('gated');
  });

  it('unanswered: unanswerd + morningRitualDone', () => {
    const t = {
      ...baseThread(),
      answers: [{ userId: partnerId, answer: 'X', submittedAt: 't' }],
      isRevealed: true,
    };
    expect(deriveHomeDailyPromptState(t, meId, partnerId, true)).toBe('unanswered');
  });

  it('no gate if user already answered (even if !morningRitualDone)', () => {
    const t: PromptThread = {
      ...baseThread(),
      answers: [{ userId: meId, answer: 'Y', submittedAt: 't' }],
      isRevealed: false,
    };
    expect(deriveHomeDailyPromptState(t, meId, partnerId, false)).toBe('answeredWaiting');
  });

  it('completed when both answered and each person has a reaction', () => {
    const t: PromptThread = {
      ...baseThread(),
      answers: [
        { userId: meId, answer: 'A', submittedAt: 't1' },
        { userId: partnerId, answer: 'B', submittedAt: 't2' },
      ],
      isRevealed: true,
      reactions: [
        { id: 'r1', userId: meId, emoji: '❤️' },
        { id: 'r2', userId: partnerId, emoji: '✨' },
      ],
    };
    expect(deriveDailyPromptState(t, meId, partnerId)).toBe('completed');
  });
});

describe('composeHomeFeed', () => {
  it('maps gated state to morning check-in CTA and no real question in copy', () => {
    const thread: PromptThread = {
      ...baseThread(),
      answers: [],
      isRevealed: false,
    };
    const vm = composeHomeFeed({
      thread,
      meId,
      partnerId,
      partnerFirstName: 'Riley',
      morningRitualDone: false,
      currentStreakDays: 0,
    });
    expect(vm.daily.state).toBe('gated');
    expect(vm.daily.ctaLabel).toBe('Morning check-in');
    expect(vm.daily.question).not.toContain('What small moment');
  });

  it('maps completed state to a finished status line and CTA', () => {
    const thread: PromptThread = {
      ...baseThread(),
      answers: [
        { userId: meId, answer: 'A', submittedAt: 't1' },
        { userId: partnerId, answer: 'B', submittedAt: 't2' },
      ],
      isRevealed: true,
      reactions: [
        { id: 'r1', userId: meId, emoji: '❤️' },
        { id: 'r2', userId: partnerId, emoji: '✨' },
      ],
    };
    const vm = composeHomeFeed({
      thread,
      meId,
      partnerId,
      partnerFirstName: 'Riley',
      morningRitualDone: true,
      currentStreakDays: 4,
    });
    expect(vm.daily.state).toBe('completed');
    expect(vm.daily.ctaLabel).toBe('View thread');
    expect(vm.partnerActivity.heading).toContain('sample');
    expect(vm.streak.disclaimer).toBeUndefined();
    expect(vm.streak.currentStreakDays).toBe(4);
  });
});
