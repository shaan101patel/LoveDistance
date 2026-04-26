import { getIsPromptRevealed } from '@/features/prompts/revealLogic';

describe('getIsPromptRevealed', () => {
  it('is false when one partner answered', () => {
    expect(getIsPromptRevealed([{ userId: 'user-1' }])).toBe(false);
  });

  it('is true when two partners answered', () => {
    expect(getIsPromptRevealed([{ userId: 'user-1' }, { userId: 'user-2' }])).toBe(true);
  });
});
