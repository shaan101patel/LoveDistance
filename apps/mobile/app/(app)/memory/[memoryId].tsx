import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { FavoriteMemoryButton } from '@/components/timeline/FavoriteMemoryButton';
import { Button } from '@/components/primitives/Button';
import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useMemory, useSetMemoryFavorite } from '@/features/hooks';
import {
  hrefFromTimelineDeepLinkRef,
  timelineDeepLinkTargetsMemorySelf,
} from '@/lib/timelineDeepLink';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

function relatedCtaLabel(ref: string): string {
  const idx = ref.indexOf(':');
  if (idx <= 0) return 'Go to Home';
  const kind = ref.slice(0, idx);
  if (kind === 'prompt') return 'Open prompt';
  if (kind === 'photo') return 'Open photo';
  if (kind === 'habit') return 'Open habit';
  if (kind === 'memory') return 'Open related memory';
  return 'Go to Home';
}

export default function MemoryDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { memoryId: raw } = useLocalSearchParams<{ memoryId: string }>();
  const memoryId = typeof raw === 'string' ? raw : raw?.[0];
  const { data, isLoading, isError, isSuccess } = useMemory(memoryId);
  const favorite = useSetMemoryFavorite();

  if (!memoryId) {
    return (
      <Screen>
        <Heading>Memory</Heading>
        <Body>Missing memory id.</Body>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Body>Loading…</Body>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Heading>Memory</Heading>
        <Body>We could not load this moment. Try again shortly.</Body>
      </Screen>
    );
  }

  if (isSuccess && !data) {
    return (
      <Screen>
        <Heading>Memory</Heading>
        <Body>This moment is not in your timeline anymore, or the link is invalid.</Body>
        <View style={{ marginTop: spacing.md }}>
          <Button label="Back to timeline" onPress={() => router.replace('/(app)/(tabs)/timeline')} />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return null;
  }

  const relatedHref = hrefFromTimelineDeepLinkRef(data.deepLinkRef);
  const hideRelatedCta = timelineDeepLinkTargetsMemorySelf(data.deepLinkRef, memoryId);
  const dateLabel = data.createdAt
    ? new Date(data.createdAt).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const onFavorite = () => {
    favorite.mutate({ memoryId: data.id, isFavorite: !data.isFavorite });
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Heading>{data.title}</Heading>
        </View>
        <FavoriteMemoryButton
          disabled={favorite.isPending}
          isFavorite={data.isFavorite}
          onPress={onFavorite}
          style={{ marginTop: spacing.xs }}
        />
      </View>

      <SectionCard>
        {dateLabel ? (
          <Text style={{ ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.sm }}>
            {dateLabel}
          </Text>
        ) : null}
        <Body>{data.summary}</Body>
        {data.imageUri ? (
          <Image
            accessibilityLabel="Memory image"
            contentFit="cover"
            source={{ uri: data.imageUri }}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: radius.lg,
              marginTop: spacing.md,
              backgroundColor: theme.colors.surfaceAlt,
            }}
          />
        ) : null}
      </SectionCard>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {!hideRelatedCta ? (
          <Button
            label={relatedCtaLabel(data.deepLinkRef)}
            onPress={() => router.push(relatedHref as Href)}
            variant="secondary"
          />
        ) : null}
        <Button label="Back to timeline" onPress={() => router.back()} variant="ghost" />
      </View>
    </Screen>
  );
}
