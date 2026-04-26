import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { aggregateReplyReactions } from '@/features/prompts/threadRepliesLayout';
import { spacing } from '@/theme/tokens';

const DEFAULT_QUICK = ['❤️', '✨', '🧡'] as const;

type PromptReaction = { emoji: string };

type Props = {
  title?: string;
  /** When false, hides the title line (e.g. nested under a reply). */
  showTitle?: boolean;
  /** Prompt-level or reply-level flat reaction list. */
  reactions: PromptReaction[];
  onPickEmoji: (emoji: string) => void;
  isPending: boolean;
  quickEmojis?: readonly string[];
};

/**
 * Quick emoji row + optional summary line (e.g. "heart 2 · sparkle 1").
 * Used for `PromptThread.reactions` and can be reused for reply rows.
 */
export function ThreadReactionBar({
  title = 'Reactions',
  showTitle = true,
  reactions,
  onPickEmoji,
  isPending,
  quickEmojis = DEFAULT_QUICK,
}: Props) {
  const theme = useTheme();
  const summary = useMemo(
    () => aggregateReplyReactions(reactions as { emoji: string }[]),
    [reactions],
  );
  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
        summary: { ...theme.type.bodySm, color: theme.colors.textSecondary, marginBottom: spacing.sm },
        row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
        pill: {
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        pillText: { fontSize: 24 },
      }),
    [theme],
  );

  return (
    <View>
      {showTitle ? <Text style={styles.label}>{title}</Text> : null}
      {summary.length > 0 ? (
        <Text style={styles.summary} accessibilityLabel="Reaction summary">
          {summary.map((s) => s.emoji + ' ' + s.count).join(' · ')}
        </Text>
      ) : null}
      <View style={styles.row}>
        {quickEmojis.map((emoji) => (
          <Pressable
            key={emoji}
            accessibilityLabel={`Add reaction ${emoji}`}
            disabled={isPending}
            onPress={() => onPickEmoji(emoji)}
            style={({ pressed }) => [styles.pill, { opacity: pressed || isPending ? 0.6 : 1 }]}
          >
            <Text style={styles.pillText}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
