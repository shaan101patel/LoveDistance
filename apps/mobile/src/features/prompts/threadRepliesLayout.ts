import type { PromptThreadReply } from '@/types/domain';

export type ReplyTreeNode = {
  reply: PromptThreadReply;
  children: ReplyTreeNode[];
};

/**
 * Group replies as a tree: top-level is `parentReplyId === null`, then nest by `parentReplyId` id.
 * Siblings are sorted by `createdAt`.
 */
export function buildReplyTree(replies: PromptThreadReply[]): ReplyTreeNode[] {
  if (replies.length === 0) {
    return [];
  }
  const byId = new Map(replies.map((r) => [r.id, r] as const));
  const childLists = new Map<string, PromptThreadReply[]>();
  for (const r of replies) {
    if (r.parentReplyId == null) {
      continue;
    }
    if (!byId.has(r.parentReplyId)) {
      // Orphan: treat as top-level to avoid losing content.
      continue;
    }
    const list = childLists.get(r.parentReplyId) ?? [];
    list.push(r);
    childLists.set(r.parentReplyId, list);
  }
  for (const list of childLists.values()) {
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  const buildChildren = (id: string): ReplyTreeNode[] => {
    const list = childLists.get(id) ?? [];
    return list
      .map((reply) => ({
        reply,
        children: buildChildren(reply.id),
      }))
      .sort((a, b) => a.reply.createdAt.localeCompare(b.reply.createdAt));
  };
  const roots: PromptThreadReply[] = [];
  for (const r of replies) {
    if (r.parentReplyId == null) {
      roots.push(r);
    } else if (!byId.has(r.parentReplyId)) {
      roots.push(r);
    }
  }
  roots.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return roots.map((reply) => ({
    reply,
    children: buildChildren(reply.id),
  }));
}

/**
 * Flattens reply reactions for a compact "❤️ 2 · ✨ 1" style summary.
 */
export function aggregateReplyReactions(
  reactions: { emoji: string }[],
): { emoji: string; count: number }[] {
  const map = new Map<string, number>();
  for (const { emoji } of reactions) {
    map.set(emoji, (map.get(emoji) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => a.emoji.localeCompare(b.emoji));
}
