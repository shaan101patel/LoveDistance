import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const IMAGE_MAX = 220;

type Props = {
  heading: string;
  text: string;
  submittedAt: string;
  imageUri?: string;
};

/**
 * One prompt answer block: optional header, body, optional image, timestamp. Text-only and text-plus-photo.
 */
export function PromptAnswerMoment({ heading, text, imageUri, submittedAt }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        meta: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.sm },
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
  return (
    <View>
      <Text style={styles.label}>{heading}</Text>
      <Text style={styles.body}>{text}</Text>
      {imageUri ? (
        <Image
          contentFit="cover"
          source={{ uri: imageUri }}
          style={styles.image}
          transition={200}
        />
      ) : null}
      <Text style={styles.meta} accessibilityLabel="Answer time">
        {new Date(submittedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}
