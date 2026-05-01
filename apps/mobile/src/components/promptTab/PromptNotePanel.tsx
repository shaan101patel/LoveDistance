import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { buildNoteBody } from '@/features/prompts/extraPromptReplyFormat';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  onSend: (body: string) => void;
  sendPending: boolean;
};

export function PromptNotePanel({ onSend, sendPending }: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.sm },
        input: {
          minHeight: 120,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...theme.type.body,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
        },
      }),
    [theme],
  );

  const trimmed = text.trim();
  const canSend = trimmed.length > 0;

  return (
    <View>
      <Text style={styles.hint}>Write a short note to your partner. It appears in today’s thread.</Text>
      <TextInput
        accessibilityLabel="Note to partner"
        multiline
        placeholder="What’s on your mind?"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={text}
        onChangeText={setText}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button
          disabled={!canSend || sendPending}
          label={sendPending ? 'Sending…' : 'Send note'}
          onPress={() => {
            onSend(buildNoteBody(trimmed));
            setText('');
          }}
        />
      </View>
    </View>
  );
}
