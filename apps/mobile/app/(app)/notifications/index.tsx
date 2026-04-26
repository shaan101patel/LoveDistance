import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, SectionList, Text, View } from 'react-native';

import { NotificationCategoryHeader, NotificationListRow } from '@/components/notifications';
import { Button } from '@/components/primitives/Button';
import { Body, Screen } from '@/components/ui';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationsRead,
  useNotificationInbox,
} from '@/features/hooks';
import type { NotificationCategory, NotificationInboxItem } from '@/types/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

const CATEGORY_ORDER: NotificationCategory[] = [
  'prompt',
  'photo',
  'reaction',
  'habit',
  'anniversary',
  'countdown',
];

type InboxSection = { category: NotificationCategory; data: NotificationInboxItem[] };

function buildSections(items: NotificationInboxItem[] | undefined): InboxSection[] {
  if (!items?.length) return [];
  const map = new Map<NotificationCategory, NotificationInboxItem[]>();
  for (const c of CATEGORY_ORDER) {
    map.set(c, []);
  }
  for (const item of items) {
    map.get(item.category)?.push(item);
  }
  return CATEGORY_ORDER.filter((c) => (map.get(c)?.length ?? 0) > 0).map((category) => ({
    category,
    data: map.get(category)!,
  }));
}

export default function NotificationsCenterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotificationInbox(50);
  const markRead = useMarkNotificationsRead();
  const markAll = useMarkAllNotificationsRead();

  const sections = useMemo(() => buildSections(data), [data]);

  const onRowPress = useCallback(
    (item: NotificationInboxItem) => {
      if (!item.read) {
        markRead.mutate([item.id]);
      }
      if (item.href) {
        router.push(item.href as Href);
      }
    },
    [markRead, router],
  );

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm }}>
        <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
          Preview data; no push delivery yet. Toggles live under Settings → Notifications.
        </Text>
        <Button
          label={markAll.isPending ? 'Updating…' : 'Mark all read'}
          variant="secondary"
          disabled={markAll.isPending || !data?.some((n) => !n.read)}
          onPress={() => markAll.mutate()}
        />
      </View>
      {isLoading ? (
        <View style={{ padding: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={{ padding: spacing.lg }}>
          <Body>Could not load notifications.</Body>
          <Button label="Retry" onPress={() => void refetch()} />
        </View>
      ) : sections.length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <Body>You are all caught up.</Body>
        </View>
      ) : (
        <SectionList<NotificationInboxItem, InboxSection>
          style={{ flex: 1 }}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <NotificationCategoryHeader category={section.category} />
          )}
          renderItem={({ item }) => <NotificationListRow item={item} onPress={() => onRowPress(item)} />}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
        />
      )}
    </Screen>
  );
}
