import { useRouter, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { FavoriteMemoryButton } from '@/components/timeline/FavoriteMemoryButton';
import { MemoryItemCard } from '@/components/timeline/MemoryItemCard';
import { MilestoneMemoryCard } from '@/components/timeline/MilestoneMemoryCard';
import { useSetMemoryFavorite } from '@/features/hooks';
import type { MemoryItem } from '@/types/domain';
import { spacing } from '@/theme/tokens';

function hrefFromRef(ref: string): Href {
  const idx = ref.indexOf(':');
  if (idx <= 0) {
    return '/(app)/(tabs)/home' as Href;
  }
  const [kind, id] = [ref.slice(0, idx), ref.slice(idx + 1)] as [string, string];
  if (kind === 'prompt') {
    return `/(app)/prompt/${id}` as Href;
  }
  if (kind === 'photo') {
    return `/(app)/photo/${id}` as Href;
  }
  if (kind === 'memory') {
    return `/(app)/memory/${id}` as Href;
  }
  if (kind === 'habit') {
    return `/(app)/habit/${id}` as Href;
  }
  return '/(app)/(tabs)/home' as Href;
}

type Props = {
  item: MemoryItem;
};

export function TimelineMemoryRow({ item }: Props) {
  const router = useRouter();
  const href = hrefFromRef(item.deepLinkRef);
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
