import { useMemo, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Tone = 'neutral' | 'primary' | 'success' | 'danger';

type Props = PropsWithChildren<{
  label?: string;
  tone?: Tone;
  style?: ViewStyle;
}>;

export function Badge({ label, children, tone = 'neutral', style }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => {
    const bg: Record<Tone, string> = {
      neutral: theme.colors.surfaceAlt,
      primary: 'rgba(199, 127, 104, 0.2)',
      success: 'rgba(63, 138, 95, 0.2)',
      danger: 'rgba(182, 74, 74, 0.2)',
    };
    const fg: Record<Tone, string> = {
      neutral: theme.colors.textSecondary,
      primary: theme.colors.primary,
      success: theme.colors.success,
      danger: theme.colors.danger,
    };
    return StyleSheet.create({
      wrap: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        backgroundColor: bg[tone],
      },
      text: { fontSize: 12, fontWeight: '600', color: fg[tone] },
    });
  }, [theme, tone]);

  return (
    <View style={[styles.wrap, style]}>
      {label != null && label !== '' ? <Text style={styles.text}>{label}</Text> : null}
      {label == null || label === '' ? children : null}
    </View>
  );
}
