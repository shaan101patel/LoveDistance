import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';

import { MemoryTimelineFilterChips, TimelineMemoryRow } from '@/components/timeline';
import { Input } from '@/components/primitives/Input';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useTimeline } from '@/features/hooks';
import { isSupabaseApiMode, timelineTabCopy } from '@/services/apiMode';
import type { MemoryItem, TimelineMemoryFilter } from '@/types/domain';
import { spacing } from '@/theme/tokens';

import { Button } from '@/components/primitives/Button';

function emptyBody(filter: TimelineMemoryFilter, hasSource: boolean): string {
  if (!hasSource) {
    if (filter === 'all') {
      return 'Nothing here yet. Answer a prompt (with an optional photo) or share to the feed to see entries.';
    }
    if (filter === 'favorites') {
      return 'No favorites yet. Saved moments will show up here.';
    }
    return 'Nothing in this category yet.';
  }
  return 'No memories match your search.';
}

export default function TimelineScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const [filter, setFilter] = useState<TimelineMemoryFilter>('all');
  const [search, setSearch] = useState('');
  const { data: memories, isLoading, isError, isRefetching, refetch } = useTimeline(filter);

  const baseList = useMemo(() => memories ?? [], [memories]);
  const displayMemories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return baseList;
    }
    return baseList.filter(
      (m) =>
        m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q),
    );
  }, [baseList, search]);

  const renderItem: ListRenderItem<MemoryItem> = useCallback(
    ({ item, index }) => (
      <View style={index > 0 ? { marginTop: spacing.md } : undefined}>
        <TimelineMemoryRow item={item} />
      </View>
    ),
    [],
  );

  const listHeader = useMemo(
    () => (
      <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
        <MemoryTimelineFilterChips onChange={setFilter} value={filter} />
        <Input
          accessibilityLabel="Search memories"
          onChangeText={setSearch}
          placeholder="Search memories…"
          value={search}
        />
      </View>
    ),
    [filter, search],
  );

  if (isLoading) {
    return (
      <SectionScaffold
        kicker="Together"
        lead={timelineTabCopy.tabLead(live)}
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
        lead={timelineTabCopy.tabLead(live)}
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

  const hasSource = baseList.length > 0;
  const emptyText = emptyBody(filter, hasSource);

  return (
    <SectionScaffold
      kicker="Together"
      lead={timelineTabCopy.tabLead(live)}
      scrollable={false}
      title="Timeline"
    >
      <FlatList
        data={displayMemories}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={emptyText ? <Body>{emptyText}</Body> : null}
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
        style={{ flex: 1, width: '100%' as const, alignSelf: 'stretch' as const }}
      />
    </SectionScaffold>
  );
}
