import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { PresencePost } from '@/types/domain';

type Props = {
  post: PresencePost;
  selected: boolean;
  selectionLocked: boolean;
  onToggle: (id: string) => void;
};

export function RecapPhotoPickRow({ post, selected, selectionLocked, onToggle }: Props) {
  const theme = useTheme();
  const disabled = selectionLocked && !selected;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${selected ? 'Deselect' : 'Select'} photo, ${post.caption ?? post.id}`}
      disabled={disabled}
      onPress={() => onToggle(post.id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
        borderWidth: 2,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderRadius: radius.lg,
        padding: spacing.sm,
        backgroundColor: theme.colors.surface,
      })}
    >
      <Image
        source={{ uri: post.imageUri }}
        style={{
          width: 72,
          height: 72,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
        }}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text numberOfLines={2} style={{ ...theme.type.bodySm, color: theme.colors.textPrimary }}>
          {post.caption ?? 'Shared moment'}
        </Text>
        <Text style={{ ...theme.type.caption, color: theme.colors.textMuted }}>
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.pill,
          borderWidth: 2,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <Text style={{ color: theme.colors.onPrimary, fontSize: 14, fontWeight: '700' }}>✓</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
