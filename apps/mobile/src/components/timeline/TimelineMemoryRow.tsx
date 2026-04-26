import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Card } from '@/components/primitives/Card';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { MemoryItem } from '@/types/domain';

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
  const theme = useTheme();
  const router = useRouter();
  const href = hrefFromRef(item.deepLinkRef);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row' as const, gap: spacing.md, alignItems: 'flex-start' as const },
        thumb: {
          width: 56,
          height: 56,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
        },
        textCol: { flex: 1, minWidth: 0, gap: 4 },
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' as const },
        summary: { ...theme.type.bodySm, color: theme.colors.textSecondary },
        date: { ...theme.type.caption, color: theme.colors.textMuted },
        type: { ...theme.type.caption, color: theme.colors.textMuted, textTransform: 'capitalize' as const },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={`Open ${item.type}: ${item.title}`}
      onPress={() => router.push(href)}
    >
      <Card elevated={false} style={{ padding: spacing.md }}>
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
            <Text style={styles.type}>{item.type}</Text>
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
      </Card>
    </Pressable>
  );
}
