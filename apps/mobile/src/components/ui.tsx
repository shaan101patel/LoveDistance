import { type PropsWithChildren, useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Button as ButtonPrimitive } from '@/components/primitives/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type ScreenProps = PropsWithChildren<{ padded?: boolean }>;

export function Screen({ children, padded = true }: ScreenProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.colors.bg },
        padded: { padding: spacing.lg, gap: spacing.md },
      }),
    [theme],
  );

  return <View style={[styles.screen, padded && styles.padded]}>{children}</View>;
}

export function SectionCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: spacing.lg,
          gap: spacing.sm,
        },
      }),
    [theme],
  );

  return <View style={[styles.card, theme.shadows.card, style]}>{children}</View>;
}

export function Heading({ children }: PropsWithChildren) {
  const theme = useTheme();
  return <Text style={theme.type.h1}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        body: { ...theme.type.bodySm, color: theme.colors.textSecondary },
      }),
    [theme],
  );

  return <Text style={styles.body}>{children}</Text>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
};

/** @deprecated Prefer `Button` from `@/components/primitives` with `secondary` variant. */
export function Button({ label, onPress, variant = 'primary', disabled }: ButtonProps) {
  return (
    <ButtonPrimitive
      disabled={disabled}
      label={label}
      onPress={onPress}
      variant={variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : 'ghost'}
    />
  );
}
