import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useDoubleTap } from '@/lib/useDoubleTap';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const IMAGE_MAX = 220;

function formatAnswerTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type Props = {
  heading: string;
  text: string;
  submittedAt: string;
  imageUri?: string;
  onDoubleTapHeart?: () => void;
  doubleTapHeartDisabled?: boolean;
};

/**
 * One prompt answer block: header row (title + time), body, optional image. Double-tap body or image to send a heart when wired.
 */
export function PromptAnswerMoment({
  heading,
  text,
  imageUri,
  submittedAt,
  onDoubleTapHeart,
  doubleTapHeartDisabled,
}: Props) {
  const theme = useTheme();
  const handleDoubleTap = useDoubleTap(() => {
    onDoubleTapHeart?.();
  });
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.xs,
        },
        label: { ...theme.type.caption, color: theme.colors.textMuted, flexShrink: 1 },
        time: { ...theme.type.caption, color: theme.colors.textMuted, flexShrink: 0 },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        image: {
          width: '100%' as const,
          maxHeight: IMAGE_MAX,
          aspectRatio: 1,
          borderRadius: radius.lg,
          backgroundColor: theme.colors.surfaceAlt,
          marginTop: spacing.md,
        },
      }),
    [theme],
  );

  const timeLabel = formatAnswerTime(submittedAt);
  const messageBlock = (
    <>
      <Text style={styles.body}>{text}</Text>
      {imageUri ? (
        <Image
          contentFit="cover"
          source={{ uri: imageUri }}
          style={styles.image}
          transition={200}
        />
      ) : null}
    </>
  );

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{heading}</Text>
        <Text style={styles.time} accessibilityLabel="Answer time">
          {timeLabel}
        </Text>
      </View>
      {onDoubleTapHeart ? (
        <Pressable
          accessibilityHint="Double tap to send a heart"
          accessibilityRole="button"
          disabled={doubleTapHeartDisabled}
          onPress={handleDoubleTap}
        >
          {messageBlock}
        </Pressable>
      ) : (
        messageBlock
      )}
    </View>
  );
}
