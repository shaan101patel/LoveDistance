import { describe, expect, it } from 'vitest';

import { filterPresencePostsInWeek, weekMetaFromMondayYmd } from '@/features/weeklyRecap/recapCandidateFilter';
import type { PresencePost } from '@/types/domain';

const posts: PresencePost[] = [
  {
    id: 'a',
    authorId: 'u1',
    imageUri: 'https://example.com/a.jpg',
    createdAt: '2026-04-22T17:00:00.000Z',
    reactionCount: 0,
  },
  {
    id: 'b',
    authorId: 'u1',
    imageUri: 'https://example.com/b.jpg',
    createdAt: '2026-04-10T17:00:00.000Z',
    reactionCount: 0,
  },
];

describe('recapCandidateFilter', () => {
  it('filters posts to the ISO week of the anchor', () => {
    const hit = filterPresencePostsInWeek(posts, '2026-04-23T12:00:00.000Z');
    expect(hit.map((p) => p.id)).toEqual(['a']);
  });

  it('builds week meta from Monday ymd', () => {
    const meta = weekMetaFromMondayYmd('2026-04-20');
    expect(meta.weekStartYmd).toBe('2026-04-20');
    expect(meta.weekEndYmd).toBe('2026-04-26');
    expect(meta.label.length).toBeGreaterThan(4);
  });
});
