import { type ReactNode, useMemo, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
  style?: ViewStyle;
}>;

export function EmptyState({ title, description, action, style, children }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        box: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
        title: {
          ...theme.type.body,
          textAlign: 'center',
          color: theme.colors.textPrimary,
          fontWeight: '600',
        },
        desc: { ...theme.type.bodySm, textAlign: 'center', color: theme.colors.textSecondary },
      }),
    [theme],
  );

  return (
    <View style={[styles.box, style]}>
      {children}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {action}
    </View>
  );
}
