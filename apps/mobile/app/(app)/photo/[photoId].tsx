import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Card } from '@/components/primitives/Card';
import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useCouple, useCurrentUserId, usePresenceFeed, useReactToPost } from '@/features/hooks';
import { isSupabaseApiMode, photoDetailCopy } from '@/services/apiMode';
import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

function titleCaseMood(mood: string) {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
}

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const id = typeof photoId === 'string' ? photoId : photoId?.[0];
  const { data: posts, isLoading } = usePresenceFeed();
  const { meId } = useCurrentUserId();
  const { data: couple } = useCouple();
  const react = useReactToPost();
  const partnerName = couple?.partner.firstName ?? 'Partner';

  const post = useMemo(() => posts?.find((p) => p.id === id) ?? null, [posts, id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        image: { width: '100%' as const, aspectRatio: 1, borderRadius: radius.lg, backgroundColor: theme.colors.surfaceAlt },
        meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
        byline: { ...theme.type.caption, color: theme.colors.textMuted, fontWeight: '600' as const },
        chip: {
          backgroundColor: theme.colors.surfaceAlt,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: radius.pill,
        },
        chipText: { ...theme.type.caption, color: theme.colors.textSecondary },
        place: { ...theme.type.caption, color: theme.colors.textMuted },
        caption: { ...theme.type.body, color: theme.colors.textPrimary, marginTop: spacing.md },
      }),
    [theme],
  );

  if (isLoading || !id) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Body>Loading…</Body>
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen>
        <Heading>Photo</Heading>
        <Body>{photoDetailCopy.notFoundBody(live)}</Body>
      </Screen>
    );
  }

  const authorLabel = meId && post.authorId === meId ? 'You' : partnerName;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Heading>Photo</Heading>
        <View style={styles.meta}>
          <Text style={styles.byline}>
            {authorLabel}
            {post.createdAt
              ? ` · ${new Date(post.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
              : ''}
          </Text>
          {post.mood ? (
            <View style={styles.chip} accessibilityLabel={`Mood ${post.mood}`}>
              <Text style={styles.chipText}>{titleCaseMood(post.mood)}</Text>
            </View>
          ) : null}
          {post.locationLabel ? <Text style={styles.place}>· {post.locationLabel}</Text> : null}
        </View>
        <Card elevated={false} style={{ overflow: 'hidden' as const, padding: 0, gap: 0 }}>
          <Image contentFit="cover" source={{ uri: post.imageUri }} style={styles.image} />
        </Card>
        {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
        <SectionCard>
          <Button
            disabled={react.isPending}
            label={post.reactionCount > 0 ? `Send love · ${post.reactionCount}` : 'Send love'}
            onPress={() => react.mutate(post.id)}
          />
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}
