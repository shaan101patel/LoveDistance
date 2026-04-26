import { describe, expect, it } from 'vitest';

import {
  buildPromptThreadViewModel,
  shouldObscurePartnerAnswer,
} from '@/features/prompts/threadViewModel';
import type { PromptThread } from '@/types/domain';

const meId = 'u-me';
const partnerId = 'u-partner';
const name = 'Riley';

const base = (): PromptThread => ({
  promptId: 'p-1',
  date: '2026-01-01',
  question: 'Q?',
  category: { id: 'c1', label: 'Connection' },
  answers: [],
  isRevealed: false,
  reactions: [],
});

describe('shouldObscurePartnerAnswer', () => {
  it('is false when revealed', () => {
    const t: PromptThread = {
      ...base(),
      isRevealed: true,
      answers: [
        { userId: meId, answer: 'a', submittedAt: '1' },
        { userId: partnerId, answer: 'b', submittedAt: '2' },
      ],
    };
    expect(shouldObscurePartnerAnswer(t, partnerId)).toBe(false);
  });

  it('is true when partner answered but thread not revealed (single-device impossible but model supports it)', () => {
    const t: PromptThread = {
      ...base(),
      isRevealed: false,
      answers: [{ userId: partnerId, answer: 'secret', submittedAt: '1' }],
    };
    expect(shouldObscurePartnerAnswer(t, partnerId)).toBe(true);
  });

  it('is false when partner has not answered', () => {
    const t: PromptThread = { ...base(), isRevealed: false, answers: [] };
    expect(shouldObscurePartnerAnswer(t, partnerId)).toBe(false);
  });
});

describe('buildPromptThreadViewModel', () => {
  it('awaitingMyAnswer with waiting partner row when no answers', () => {
    const vm = buildPromptThreadViewModel({ thread: base(), meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('awaitingMyAnswer');
    if (vm.phase !== 'awaitingMyAnswer') {
      return;
    }
    expect(vm.myAnswer).toBeNull();
    expect(vm.partnerRow).toEqual({ kind: 'waiting', partnerFirstName: name });
  });

  it('awaitingMyAnswer with obscured when partner only answered and not revealed', () => {
    const t: PromptThread = {
      ...base(),
      answers: [{ userId: partnerId, answer: 'Their draft', submittedAt: 't' }],
      isRevealed: false,
    };
    const vm = buildPromptThreadViewModel({ thread: t, meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('awaitingMyAnswer');
    if (vm.phase !== 'awaitingMyAnswer') {
      return;
    }
    expect(vm.partnerRow).toEqual({ kind: 'obscured' });
  });

  it('awaitingPartner when I answered and partner has not', () => {
    const t: PromptThread = {
      ...base(),
      answers: [{ userId: meId, answer: 'Me', submittedAt: 't' }],
      isRevealed: false,
    };
    const vm = buildPromptThreadViewModel({ thread: t, meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('awaitingPartner');
    if (vm.phase !== 'awaitingPartner') {
      return;
    }
    expect(vm.myAnswer.answer).toBe('Me');
    expect(vm.partnerRow).toEqual({ kind: 'waiting', partnerFirstName: name });
  });

  it('unlocked when both answers and isRevealed', () => {
    const t: PromptThread = {
      ...base(),
      isRevealed: true,
      answers: [
        { userId: meId, answer: 'A', submittedAt: '1' },
        { userId: partnerId, answer: 'B', submittedAt: '2' },
      ],
    };
    const vm = buildPromptThreadViewModel({ thread: t, meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('unlocked');
    if (vm.phase !== 'unlocked') {
      return;
    }
    expect(vm.partnerAnswer.answer).toBe('B');
    expect(vm.myAnswer.answer).toBe('A');
  });

  it('unlocked includes optional imageUri on answers', () => {
    const t: PromptThread = {
      ...base(),
      isRevealed: true,
      answers: [
        { userId: meId, answer: 'A', submittedAt: '1' },
        {
          userId: partnerId,
          answer: 'B',
          submittedAt: '2',
          imageUri: 'https://example.com/p.jpg',
        },
      ],
    };
    const vm = buildPromptThreadViewModel({ thread: t, meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('unlocked');
    if (vm.phase !== 'unlocked') {
      return;
    }
    expect(vm.partnerAnswer.imageUri).toBe('https://example.com/p.jpg');
  });

  it('visible partner row passes imageUri when revealed', () => {
    const t: PromptThread = {
      ...base(),
      isRevealed: true,
      answers: [
        { userId: meId, answer: 'A', submittedAt: '1' },
        {
          userId: partnerId,
          answer: 'B',
          submittedAt: '2',
          imageUri: 'file:///local.jpg',
        },
      ],
    };
    const vm = buildPromptThreadViewModel({ thread: t, meId, partnerId, partnerFirstName: name });
    expect(vm.phase).toBe('unlocked');
    if (vm.phase !== 'unlocked') {
      return;
    }
    // Partner row in unlocked is not used as PartnerRowModel—partnerAnswer carries imageUri.
    expect(vm.partnerAnswer.imageUri).toBe('file:///local.jpg');
  });
});
