import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const MAX = 2000;

type Props = {
  onSubmit: (body: string, parentReplyId: string | null) => void;
  isSubmitting: boolean;
  parentReplyId: string | null;
  onClearParent: () => void;
  /** When revision increments, `prefillText` replaces the field (e.g. suggestion chip). */
  prefillRevision?: number;
  prefillText?: string;
};

/**
 * Post-unlock follow-up composer. Set `parentReplyId` to thread under a specific reply.
 */
export function ThreadReplyComposer({
  onSubmit,
  isSubmitting,
  parentReplyId,
  onClearParent,
  prefillRevision = 0,
  prefillText = '',
}: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');

  useEffect(() => {
    if (prefillRevision > 0 && prefillText) {
      setText(prefillText);
    }
  }, [prefillRevision, prefillText]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
        input: {
          minHeight: 88,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...theme.type.body,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
        },
        count: { ...theme.type.caption, color: theme.colors.textMuted, textAlign: 'right' as const },
        footer: { marginTop: spacing.md },
        link: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' as const, marginTop: spacing.xs },
      }),
    [theme],
  );
  const trimmed = text.trim();
  const can = trimmed.length > 0 && trimmed.length <= MAX;

  return (
    <View>
      {parentReplyId ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={styles.hint} accessibilityLabel="Threading mode">
            Replying in thread —{' '}
          </Text>
          <Pressable accessibilityLabel="Cancel reply threading" onPress={onClearParent}>
            <Text style={styles.link}>cancel</Text>
          </Pressable>
        </View>
      ) : null}
      <TextInput
        accessibilityLabel="Follow-up message"
        multiline
        onChangeText={setText}
        placeholder="Write a follow-up…"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={text}
      />
      <Text style={styles.count}>
        {text.length} / {MAX}
      </Text>
      <View style={styles.footer}>
        <Button
          disabled={!can || isSubmitting}
          label={isSubmitting ? 'Sending…' : 'Send'}
          onPress={() => {
            onSubmit(trimmed, parentReplyId);
            setText('');
          }}
        />
      </View>
    </View>
  );
}
