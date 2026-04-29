import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReplyTreeNode } from '@/features/prompts/threadRepliesLayout';
import { useDoubleTap } from '@/lib/useDoubleTap';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const HEART_EMOJI = '❤️';

function formatReplyTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
  const handleDoubleTap = useDoubleTap(() => {
    onReact(node.reply.id, HEART_EMOJI);
  });
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginLeft: Math.min(depth, 4) * 12,
          borderLeftWidth: depth > 0 ? 2 : 0,
          borderLeftColor: theme.colors.border,
          paddingLeft: depth > 0 ? spacing.md : 0,
          paddingVertical: spacing.sm,
          gap: spacing.xs,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing.sm,
        },
        name: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const, flexShrink: 1 },
        time: { ...theme.type.caption, color: theme.colors.textMuted, flexShrink: 0 },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        replyLink: { alignSelf: 'flex-start' as const, marginTop: 4 },
        replyText: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' as const },
      }),
    [depth, theme],
  );

  return (
    <View>
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{label}</Text>
          <Text style={styles.time} accessibilityLabel="Time sent">
            {formatReplyTime(node.reply.createdAt)}
          </Text>
        </View>
        <Pressable
          accessibilityHint="Double tap to send a heart"
          accessibilityRole="button"
          disabled={replyReactionPending}
          onPress={handleDoubleTap}
        >
          <Text style={styles.body}>{node.reply.body}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Reply to this message"
          onPress={() => onReply(node.reply.id)}
          style={styles.replyLink}
        >
          <Text style={styles.replyText}>Reply</Text>
        </Pressable>
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
