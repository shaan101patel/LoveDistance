import { describe, expect, it } from 'vitest';

import type { CouplesPromptLibraryEntry } from '@/data/generatedCouplesPromptLibrary';
import { fnv1a32, pickCouplesPromptForDay } from '@/features/prompts/promptLibraryPick';

describe('fnv1a32', () => {
  it('is stable for the same input', () => {
    expect(fnv1a32('a|b')).toBe(fnv1a32('a|b'));
  });

  it('differs for different keys', () => {
    expect(fnv1a32('couple-1|2026-04-30')).not.toBe(fnv1a32('couple-2|2026-04-30'));
  });
});

describe('pickCouplesPromptForDay', () => {
  const tinyLib: CouplesPromptLibraryEntry[] = [
    {
      categoryId: 'a',
      categoryLabel: 'A',
      promptNum: 1,
      text: 'SFW one',
      morningWakeUp: 'Anytime',
      nsfw: false,
    },
    {
      categoryId: 'sexual_intimacy',
      categoryLabel: 'Sexual intimacy',
      promptNum: 1,
      text: 'NSFW one',
      morningWakeUp: 'Anytime',
      nsfw: true,
    },
    {
      categoryId: 'b',
      categoryLabel: 'B',
      promptNum: 2,
      text: 'SFW two',
      morningWakeUp: 'Morning',
      nsfw: false,
    },
  ];

  it('excludes nsfw when allowNsfw is false', () => {
    const p = pickCouplesPromptForDay('c1', '2026-01-01', false, tinyLib);
    expect(p.question).not.toBe('NSFW one');
    expect(p.category?.id).not.toBe('sexual_intimacy');
  });

  it('can include nsfw when allowNsfw is true', () => {
    const hitsNsfw = Array.from({ length: 400 }, (_, i) =>
      pickCouplesPromptForDay(`id-${i}`, '2026-06-15', true, tinyLib),
    ).some((p) => p.question === 'NSFW one');
    expect(hitsNsfw).toBe(true);
  });

  it('is deterministic for same couple and date', () => {
    const a = pickCouplesPromptForDay('same', '2026-03-01', false, tinyLib);
    const b = pickCouplesPromptForDay('same', '2026-03-01', false, tinyLib);
    expect(a).toEqual(b);
  });

  it('uses legacy fallback when library is empty', () => {
    const p = pickCouplesPromptForDay('x', '2026-01-01', true, []);
    expect(p.question).toBe('What brought you closer today?');
    expect(p.category).toBeNull();
  });
});
