import { describe, expect, it } from 'vitest';

import {
  aggregateReplyReactions,
  buildReplyTree,
} from '@/features/prompts/threadRepliesLayout';
import type { PromptThreadReply } from '@/types/domain';

const pid = 'p1';

const mk = (id: string, parent: string | null, body: string, time: string): PromptThreadReply => ({
  id,
  promptId: pid,
  parentReplyId: parent,
  authorId: 'u1',
  body,
  createdAt: time,
  reactions: [],
});

describe('buildReplyTree', () => {
  it('returns empty for empty list', () => {
    expect(buildReplyTree([])).toEqual([]);
  });

  it('orders a single top-level node', () => {
    const a = [mk('1', null, 'a', '2026-01-01T00:00:00.000Z')];
    const tree = buildReplyTree(a);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.reply.id).toBe('1');
    expect(tree[0]!.children).toHaveLength(0);
  });

  it('nests one child under a parent and sorts by time', () => {
    const list = [
      mk('b', 'a', 'child', '2026-01-01T12:00:00.000Z'),
      mk('a', null, 'root', '2026-01-01T10:00:00.000Z'),
    ];
    const tree = buildReplyTree(list);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.reply.id).toBe('a');
    expect(tree[0]!.children).toHaveLength(1);
    expect(tree[0]!.children[0]!.reply.id).toBe('b');
  });

  it('places orphan nested ids as top-level to avoid loss', () => {
    const list = [mk('x', 'missing', 'o', '2026-01-01T00:00:00.000Z')];
    const tree = buildReplyTree(list);
    expect(tree[0]!.reply.id).toBe('x');
  });
});

describe('aggregateReplyReactions', () => {
  it('aggregates by emoji', () => {
    const out = aggregateReplyReactions([{ emoji: '❤️' }, { emoji: '❤️' }, { emoji: '✨' }]);
    const heart = out.find((r) => r.emoji === '❤️');
    const spark = out.find((r) => r.emoji === '✨');
    expect(heart?.count).toBe(2);
    expect(spark?.count).toBe(1);
  });
});
