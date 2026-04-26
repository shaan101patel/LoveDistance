import { useMemo } from 'react';
import { type TextInputProps, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type TextareaProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, style, ...rest }: TextareaProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        field: {
          minHeight: 100,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          color: theme.colors.textPrimary,
          fontSize: 16,
          textAlignVertical: 'top',
        },
        label: {
          ...theme.type.caption,
          color: theme.colors.textSecondary,
          marginBottom: spacing.xs,
        },
        error: { ...theme.type.caption, color: theme.colors.danger, marginTop: spacing.xs },
      }),
    [error, theme],
  );

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        multiline
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.field, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
