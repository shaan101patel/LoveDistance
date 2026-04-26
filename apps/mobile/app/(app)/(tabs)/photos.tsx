import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/primitives/Button';
import { PhotoPostCard } from '@/components/presence';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useCouple, useCurrentUserId, usePresenceFeed, useReactToPost } from '@/features/hooks';
import { isSupabaseApiMode, photosTabCopy } from '@/services/apiMode';
import { useTheme } from '@/theme/ThemeProvider';
import type { PresencePost } from '@/types/domain';
import { spacing } from '@/theme/tokens';

const composeHref = '/(app)/photo/compose' as Href;
const recapSelectHref = '/(app)/weekly-recap/select' as Href;
const GAP = spacing.lg;

export default function PhotosTabScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const router = useRouter();
  const { data: couple } = useCouple();
  const { meId } = useCurrentUserId();
  const { data: posts, isLoading, isError, isRefetching, refetch } = usePresenceFeed();
  const react = useReactToPost();
  const partnerName = couple?.partner.firstName ?? 'Partner';

  const onReact = useCallback(
    (id: string) => {
      react.mutate(id);
    },
    [react],
  );

  const renderItem: ListRenderItem<PresencePost> = useCallback(
    ({ item: post, index }) => (
      <View style={index > 0 ? { marginTop: GAP } : undefined}>
        <PhotoPostCard
          isReacting={react.isPending && react.variables === post.id}
          meId={meId!}
          partnerName={partnerName}
          post={post}
          onPressReact={onReact}
        />
      </View>
    ),
    [meId, onReact, partnerName, react.isPending, react.variables],
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.startRow}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Button label="Add photo" onPress={() => router.push(composeHref)} />
          <Button
            label="Sunday recap"
            variant="secondary"
            onPress={() => router.push(recapSelectHref)}
          />
        </View>
      </View>
    ),
    [router],
  );

  const listEmpty = useCallback(
    () => (
      <View style={styles.emptyBlock}>
        <Body>No photos yet. Use &quot;Add photo&quot; above to try the flow.</Body>
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <SectionScaffold
        kicker="Presence"
        lead={photosTabCopy.tabLead(live)}
        title="Photos"
      >
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Body>Loading your feed…</Body>
        </View>
      </SectionScaffold>
    );
  }

  if (isError) {
    return (
      <SectionScaffold
        kicker="Presence"
        lead={photosTabCopy.tabLead(live)}
        title="Photos"
      >
        <View style={styles.errorBlock}>
          <Body>Could not load photos.</Body>
          <View style={styles.startRow}>
            <Button
              label="Try again"
              onPress={() => {
                void refetch();
              }}
            />
          </View>
        </View>
      </SectionScaffold>
    );
  }

  if (!meId) {
    return (
      <SectionScaffold
        kicker="Presence"
        lead={photosTabCopy.tabLead(live)}
        title="Photos"
      >
        <Body>We need your profile to show who shared each post.</Body>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Presence"
      lead={photosTabCopy.tabLead(live)}
      scrollable={false}
      title="Photos"
    >
      <FlatList
        data={posts ?? []}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void refetch();
            }}
            refreshing={isRefetching}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={renderItem}
        style={styles.list}
      />
    </SectionScaffold>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, width: '100%' as const, alignSelf: 'stretch' as const },
  startRow: { alignSelf: 'flex-start' as const, marginBottom: spacing.md },
  center: { paddingVertical: spacing.xl, alignItems: 'center' as const, gap: spacing.md },
  errorBlock: { gap: spacing.md },
  emptyBlock: { paddingVertical: spacing.md, gap: spacing.md },
});
