import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { FavoriteMemoryButton } from '@/components/timeline/FavoriteMemoryButton';
import { MemoryItemCard } from '@/components/timeline/MemoryItemCard';
import { MilestoneMemoryCard } from '@/components/timeline/MilestoneMemoryCard';
import { useSetMemoryFavorite } from '@/features/hooks';
import { hrefFromTimelineDeepLinkRef } from '@/lib/timelineDeepLink';
import type { MemoryItem } from '@/types/domain';
import { spacing } from '@/theme/tokens';

type Props = {
  item: MemoryItem;
};

export function TimelineMemoryRow({ item }: Props) {
  const router = useRouter();
  const href = hrefFromTimelineDeepLinkRef(item.deepLinkRef);
  const { mutate, isPending } = useSetMemoryFavorite();

  const onNavigate = () => router.push(href);
  const onFavorite = () => mutate({ memoryId: item.id, isFavorite: !item.isFavorite });

  if (item.type === 'milestone') {
    return (
      <View
        style={{
          flexDirection: 'row' as const,
          alignItems: 'flex-start' as const,
          gap: spacing.xs,
        }}
      >
        <Pressable
          accessibilityLabel={`Open milestone: ${item.title}`}
          onPress={onNavigate}
          style={({ pressed }) => [{ flex: 1, minWidth: 0, opacity: pressed ? 0.9 : 1 }]}
        >
          <MilestoneMemoryCard item={item} />
        </Pressable>
        <View style={{ paddingTop: spacing.sm }}>
          <FavoriteMemoryButton
            disabled={isPending}
            isFavorite={item.isFavorite}
            onPress={onFavorite}
          />
        </View>
      </View>
    );
  }

  return (
    <MemoryItemCard
      favoriteDisabled={isPending}
      item={item}
      onFavoritePress={onFavorite}
      onRowPress={onNavigate}
    />
  );
}
