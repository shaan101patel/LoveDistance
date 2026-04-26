import { useMemo } from 'react';
import { type TextInputProps, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        field: {
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: radius.md,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          color: theme.colors.textPrimary,
          fontSize: 16,
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
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.field, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
