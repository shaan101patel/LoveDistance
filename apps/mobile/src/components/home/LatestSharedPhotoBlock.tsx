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
  meId: string;
  partnerFirstName: string;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) {
    return 'Just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric' });
}

function trimCaption(s: string, max = 72) {
  const t = s.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

export function LatestSharedPhotoBlock({ post, meId, partnerFirstName }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const author = post.authorId === meId ? 'You' : partnerFirstName;
  const href = `/(app)/photo/${post.id}` as Href;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
        thumb: {
          width: 72,
          height: 72,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
        },
        textCol: { flex: 1, gap: 4, minWidth: 0 },
        kicker: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const },
        line: { ...theme.type.bodySm, color: theme.colors.textSecondary },
        sub: { ...theme.type.caption, color: theme.colors.textMuted },
      }),
    [theme],
  );

  return (
    <Pressable accessibilityLabel="Open latest shared photo" onPress={() => router.push(href)}>
      <Card elevated={false} style={{ padding: spacing.md }}>
        <View style={styles.row}>
          <Image
            contentFit="cover"
            recyclingKey={post.id}
            source={{ uri: post.imageUri }}
            style={styles.thumb}
            transition={200}
          />
          <View style={styles.textCol}>
            <Text style={styles.kicker}>Latest shared photo</Text>
            <Text style={styles.line} numberOfLines={2}>
              {author}
              {' · '}
              {formatWhen(post.createdAt)}
            </Text>
            {post.caption ? (
              <Text style={styles.sub} numberOfLines={1}>
                {trimCaption(post.caption)}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
