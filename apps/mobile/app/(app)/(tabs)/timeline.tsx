import { useCallback } from 'react';
import { ActivityIndicator, FlatList, type ListRenderItem, RefreshControl, View } from 'react-native';

import { TimelineMemoryRow } from '@/components/timeline';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useTimeline } from '@/features/hooks';
import type { MemoryItem } from '@/types/domain';
import { spacing } from '@/theme/tokens';

import { Button } from '@/components/primitives/Button';

export default function TimelineScreen() {
  const theme = useTheme();
  const { data: memories, isLoading, isError, isRefetching, refetch } = useTimeline('all');

  const renderItem: ListRenderItem<MemoryItem> = useCallback(
    ({ item, index }) => (
      <View style={index > 0 ? { marginTop: spacing.md } : undefined}>
        <TimelineMemoryRow item={item} />
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <SectionScaffold
        kicker="Together"
        lead="Prompts, photos, and moments in one place—local mock data until the backend is wired."
        title="Timeline"
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Body>Loading your story…</Body>
      </SectionScaffold>
    );
  }

  if (isError) {
    return (
      <SectionScaffold
        kicker="Together"
        lead="Prompts, photos, and moments in one place—local mock data until the backend is wired."
        title="Timeline"
      >
        <Body>Couldn’t load the timeline.</Body>
        <View style={{ marginTop: spacing.md, alignSelf: 'flex-start' as const }}>
          <Button
            label="Try again"
            onPress={() => {
              void refetch();
            }}
          />
        </View>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Together"
      lead="Prompts, photos, and moments in one place—local mock data until the backend is wired."
      scrollable={false}
      title="Timeline"
    >
      <FlatList
        data={memories ?? []}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={
          <Body>Nothing here yet. Answer a prompt (with an optional photo) or share to the feed to see entries.</Body>
        }
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
        style={{ flex: 1, width: '100%' as const, alignSelf: 'stretch' as const }}
      />
    </SectionScaffold>
  );
}
