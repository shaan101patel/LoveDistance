import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Card } from '@/components/primitives/Card';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { PresencePost } from '@/types/domain';

type Props = {
  post: PresencePost;
  /** Display "You" when `authorId` matches, otherwise this label. */
  partnerName: string;
  meId: string;
  onPressReact?: (postId: string) => void;
  isReacting?: boolean;
};

function titleCaseMood(mood: string) {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
}

export function PhotoPostCard({ post, partnerName, meId, onPressReact, isReacting }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const authorLabel = post.authorId === meId ? 'You' : partnerName;
  const href = `/(app)/photo/${post.id}` as Href;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
        name: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const },
        chip: {
          backgroundColor: theme.colors.surfaceAlt,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: radius.pill,
        },
        chipText: { ...theme.type.caption, color: theme.colors.textSecondary },
        place: { ...theme.type.caption, color: theme.colors.textMuted },
        image: { width: '100%' as const, aspectRatio: 1, borderRadius: radius.lg, backgroundColor: theme.colors.surfaceAlt },
        caption: { ...theme.type.body, color: theme.colors.textPrimary, marginTop: spacing.md },
        footer: {
          marginTop: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        time: { ...theme.type.caption, color: theme.colors.textMuted },
        react: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' as const },
        reactDimmed: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const, opacity: 0.5 },
      }),
    [theme],
  );
  return (
    <Card elevated>
      <View style={styles.meta}>
        <Text style={styles.name}>{authorLabel}</Text>
        {post.mood ? (
          <View style={styles.chip} accessibilityLabel={`Mood ${post.mood}`}>
            <Text style={styles.chipText}>{titleCaseMood(post.mood)}</Text>
          </View>
        ) : null}
        {post.locationLabel ? <Text style={styles.place}>· {post.locationLabel}</Text> : null}
      </View>
      <Pressable accessibilityLabel="View photo" onPress={() => router.push(href)}>
        <Image
          contentFit="cover"
          recyclingKey={post.id}
          source={{ uri: post.imageUri }}
          style={styles.image}
          transition={200}
        />
      </Pressable>
      {post.caption ? (
        <Pressable onPress={() => router.push(href)}>
          <Text style={styles.caption}>{post.caption}</Text>
        </Pressable>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.time} accessibilityLabel="Date posted">
          {new Date(post.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        {onPressReact ? (
          <Pressable
            accessibilityLabel="Add reaction to photo"
            accessibilityState={{ disabled: Boolean(isReacting) }}
            disabled={isReacting}
            onPress={() => onPressReact(post.id)}
          >
            <Text style={isReacting ? styles.reactDimmed : styles.react}>
              {post.reactionCount > 0 ? `♥ ${post.reactionCount}` : 'React'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}
