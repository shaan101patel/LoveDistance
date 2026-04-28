import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          borderRadius: radius.pill,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xxl,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primary: {
          backgroundColor: theme.colors.primary,
          ...theme.shadows.button,
        },
        primaryText: { color: theme.colors.onPrimary, fontWeight: '600', fontSize: 15 },
        secondary: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        secondaryText: { color: theme.colors.primary, fontWeight: '600', fontSize: 15 },
        ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
        ghostText: { color: theme.colors.primary, fontWeight: '600', fontSize: 15 },
        danger: { backgroundColor: theme.colors.danger },
        dangerText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
        pressed: { opacity: 0.9 },
        disabled: { opacity: 0.4 },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'ghost' && styles.ghostText,
          variant === 'danger' && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
