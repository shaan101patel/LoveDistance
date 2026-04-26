import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Image } from 'expo-image';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const MOODS = ['soft', 'cozy', 'giddy', 'grateful', 'silly'] as const;
export type MoodTag = (typeof MOODS)[number] | null;

type Props = {
  imageUri: string;
  caption: string;
  onCaptionChange: (v: string) => void;
  selectedMood: MoodTag;
  onSelectMood: (m: MoodTag) => void;
  locationLabel: string;
  onLocationChange: (v: string) => void;
};

/**
 * Shared preview + metadata fields for the photo share flow.
 */
export function PhotoSharePreviewForm({
  imageUri,
  caption,
  onCaptionChange,
  selectedMood,
  onSelectMood,
  locationLabel,
  onLocationChange,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        image: { width: '100%' as const, aspectRatio: 1, borderRadius: radius.lg, backgroundColor: theme.colors.surfaceAlt },
        fieldLabel: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...theme.type.body,
          color: theme.colors.textPrimary,
        },
        moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        moodChip: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
        },
        moodText: { ...theme.type.caption, fontWeight: '600' as const },
      }),
    [theme],
  );

  return (
    <View>
      <Image contentFit="cover" source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.fieldLabel}>Caption (optional)</Text>
      <TextInput
        accessibilityLabel="Photo caption"
        multiline
        onChangeText={onCaptionChange}
        placeholder="Say something about this moment…"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={caption}
      />
      <Text style={styles.fieldLabel}>Mood (optional)</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const active = selectedMood === m;
          return (
            <Pressable
              key={m}
              accessibilityLabel={`Mood ${m}`}
              accessibilityState={{ selected: active }}
              onPress={() => onSelectMood(active ? null : m)}
              style={({ pressed }) => [
                styles.moodChip,
                {
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.surfaceAlt : theme.colors.surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.moodText,
                  { color: active ? theme.colors.primary : theme.colors.textSecondary },
                ]}
              >
                {m}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.fieldLabel}>Location (optional)</Text>
      <TextInput
        accessibilityLabel="Location label"
        onChangeText={onLocationChange}
        placeholder="e.g. Austin · our café"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        value={locationLabel}
      />
    </View>
  );
}
