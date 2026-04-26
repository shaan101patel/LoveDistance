import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const MAX_LEN = 4000;

type Props = {
  onSubmit: (answer: string) => void;
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
      <View style={styles.footer}>
        <Button
          disabled={!canSubmit || isSubmitting}
          label={isSubmitting ? 'Sending…' : submitLabel}
          onPress={() => onSubmit(trimmed)}
        />
      </View>
    </View>
  );
}
