import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Card } from '@/components/primitives/Card';
import { FavoriteMemoryButton } from '@/components/timeline/FavoriteMemoryButton';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { MemoryItem, MemoryType } from '@/types/domain';

const typeLabels: Record<MemoryType, string> = {
  prompt: 'Prompt',
  photo: 'Photo',
  gratitude: 'Gratitude',
  milestone: 'Milestone',
};

function labelForType(type: MemoryType): string {
  return typeLabels[type];
}

type Props = {
  item: MemoryItem;
  onRowPress?: () => void;
  onFavoritePress?: () => void;
  favoriteDisabled?: boolean;
};

export function MemoryItemCard({ item, onRowPress, onFavoritePress, favoriteDisabled }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        outer: {
          flexDirection: 'row' as const,
          alignItems: 'flex-start' as const,
          gap: spacing.sm,
        },
        main: { flex: 1, minWidth: 0 },
        row: { flexDirection: 'row' as const, gap: spacing.md, alignItems: 'flex-start' as const },
        thumb: {
          width: 56,
          height: 56,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
        },
        textCol: { flex: 1, minWidth: 0, gap: 4 },
        type: { ...theme.type.caption, color: theme.colors.textMuted },
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' as const },
        summary: { ...theme.type.bodySm, color: theme.colors.textSecondary },
        date: { ...theme.type.caption, color: theme.colors.textMuted },
      }),
    [theme],
  );

  const typeLabel = labelForType(item.type);

  const body = (
    <View style={styles.row}>
      {item.imageUri ? (
        <Image
          contentFit="cover"
          source={{ uri: item.imageUri }}
          style={styles.thumb}
          transition={200}
        />
      ) : (
        <View style={styles.thumb} />
      )}
      <View style={styles.textCol}>
        <Text style={styles.type}>{typeLabel}</Text>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.summary}>
          {item.summary}
        </Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <Card elevated={false} style={{ padding: spacing.md }}>
      <View style={styles.outer}>
        {onRowPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRowPress}
            style={({ pressed }) => [styles.main, { opacity: pressed ? 0.85 : 1 }]}
          >
            {body}
          </Pressable>
        ) : (
          <View style={styles.main}>{body}</View>
        )}
        {onFavoritePress ? (
          <View style={{ paddingTop: spacing.sm }}>
            <FavoriteMemoryButton
              disabled={favoriteDisabled}
              isFavorite={item.isFavorite}
              onPress={onFavoritePress}
            />
          </View>
        ) : null}
      </View>
    </Card>
  );
}
