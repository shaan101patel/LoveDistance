import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const MAX_LEN = 4000;

const DEMO = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

export type PromptAnswerSubmitPayload = { answer: string; imageUri: string | null };

type Props = {
  onSubmit: (payload: PromptAnswerSubmitPayload) => void;
  isSubmitting: boolean;
  submitLabel?: string;
};

export function PromptAnswerComposer({
  onSubmit,
  isSubmitting,
  submitLabel = 'Share answer',
}: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const showPicker = useCallback(
    (mode: 'library' | 'camera' | 'demo') => {
      if (mode === 'demo') {
        setImageUri(DEMO);
        return;
      }
      void (async () => {
        if (mode === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            return;
          }
          const r = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
          if (!r.canceled && r.assets[0]) {
            setImageUri(r.assets[0].uri);
          }
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            return;
          }
          const r = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          });
          if (!r.canceled && r.assets[0]) {
            setImageUri(r.assets[0].uri);
          }
        }
      })();
    },
    [],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        count: { ...theme.type.caption, color: theme.colors.textMuted, textAlign: 'right' as const },
        input: {
          minHeight: 140,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...theme.type.body,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
        },
        error: { ...theme.type.caption, color: theme.colors.danger, marginTop: spacing.xs },
        footer: { marginTop: spacing.md, gap: spacing.sm },
        photoRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm, marginTop: spacing.md },
        photoBtn: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' as const },
        thumbWrap: { marginTop: spacing.sm, flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.md },
        thumb: {
          width: 80,
          height: 80,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surfaceAlt,
        },
        remove: { ...theme.type.caption, color: theme.colors.danger, fontWeight: '600' as const },
      }),
    [theme],
  );

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LEN;
  const showLenError = text.length > MAX_LEN;

  return (
    <View>
      <TextInput
        accessibilityLabel="Your answer"
        multiline
        onChangeText={setText}
        placeholder="Write your answer here…"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={text}
      />
      <Text style={styles.count}>
        {text.length} / {MAX_LEN}
      </Text>
      {showLenError ? <Text style={styles.error}>Shorten your answer a bit to continue.</Text> : null}
      <View style={styles.photoRow}>
        <Pressable onPress={() => showPicker('camera')}>
          <Text style={styles.photoBtn}>Take photo</Text>
        </Pressable>
        <Text style={{ color: theme.colors.textMuted }}>·</Text>
        <Pressable onPress={() => showPicker('library')}>
          <Text style={styles.photoBtn}>Attach from library</Text>
        </Pressable>
        <Text style={{ color: theme.colors.textMuted }}>·</Text>
        <Pressable onPress={() => showPicker('demo')}>
          <Text style={styles.photoBtn}>Use demo</Text>
        </Pressable>
      </View>
      {imageUri ? (
        <View style={styles.thumbWrap}>
          <Image
            accessibilityLabel="Attachment preview"
            source={{ uri: imageUri }}
            style={styles.thumb}
          />
          <Pressable onPress={() => setImageUri(null)} accessibilityLabel="Remove attachment">
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.footer}>
        <Button
          disabled={!canSubmit || isSubmitting}
          label={isSubmitting ? 'Sending…' : submitLabel}
          onPress={() => onSubmit({ answer: trimmed, imageUri })}
        />
      </View>
    </View>
  );
}
