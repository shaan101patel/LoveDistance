import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThreadReactionBar } from '@/components/prompt/ThreadReactionBar';
import type { ReplyTreeNode } from '@/features/prompts/threadRepliesLayout';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const REPLY_QUICK = ['👍', '❤️', '✨'] as const;

type RowProps = {
  node: ReplyTreeNode;
  depth: number;
  meId: string;
  partnerName: string;
  onReply: (parentReplyId: string) => void;
  onReact: (replyId: string, emoji: string) => void;
  replyReactionPending: boolean;
};

function ThreadReplyRow({
  node,
  depth,
  meId,
  partnerName,
  onReply,
  onReact,
  replyReactionPending,
}: RowProps) {
  const theme = useTheme();
  const isMe = node.reply.authorId === meId;
  const label = isMe ? 'You' : partnerName;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { marginLeft: Math.min(depth, 4) * 12, borderLeftWidth: depth > 0 ? 2 : 0, borderLeftColor: theme.colors.border, paddingLeft: depth > 0 ? spacing.md : 0, paddingVertical: spacing.sm, gap: spacing.xs },
        name: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        meta: { ...theme.type.caption, color: theme.colors.textMuted },
        replyLink: { alignSelf: 'flex-start' as const, marginTop: 4 },
        replyText: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' as const },
        react: { marginTop: spacing.xs },
      }),
    [depth, theme],
  );

  return (
    <View>
      <View style={styles.wrap}>
        <Text style={styles.name}>{label}</Text>
        <Text style={styles.body}>{node.reply.body}</Text>
        <Text style={styles.meta} accessibilityLabel="Time sent">
          {new Date(node.reply.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        <Pressable
          accessibilityLabel="Reply to this message"
          onPress={() => onReply(node.reply.id)}
          style={styles.replyLink}
        >
          <Text style={styles.replyText}>Reply</Text>
        </Pressable>
        <View style={styles.react}>
          <ThreadReactionBar
            isPending={replyReactionPending}
            reactions={node.reply.reactions}
            showTitle={false}
            onPickEmoji={(emoji) => onReact(node.reply.id, emoji)}
            quickEmojis={REPLY_QUICK}
            title="React"
          />
        </View>
      </View>
      {node.children.map((ch) => (
        <ThreadReplyRow
          key={ch.reply.id}
          meId={meId}
          node={ch}
          partnerName={partnerName}
          depth={depth + 1}
          onReact={onReact}
          onReply={onReply}
          replyReactionPending={replyReactionPending}
        />
      ))}
    </View>
  );
}

type ListProps = {
  roots: ReplyTreeNode[];
  meId: string;
  partnerName: string;
  onReply: (parentReplyId: string) => void;
  onReact: (replyId: string, emoji: string) => void;
  replyReactionPending: boolean;
};

export function ThreadReplyList({
  roots,
  meId,
  partnerName,
  onReply,
  onReact,
  replyReactionPending,
}: ListProps) {
  if (roots.length === 0) {
    return null;
  }
  return (
    <View>
      {roots.map((node) => (
        <ThreadReplyRow
          key={node.reply.id}
          depth={0}
          meId={meId}
          node={node}
          partnerName={partnerName}
          replyReactionPending={replyReactionPending}
          onReact={onReact}
          onReply={onReply}
        />
      ))}
    </View>
  );
}
