import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type TopBarProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function TopBar({ title, left, right }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top,
          ...theme.shadows.topBar,
        },
        row: {
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        },
        side: { width: 48, alignItems: 'center', justifyContent: 'center' },
        title: {
          flex: 1,
          textAlign: 'center',
          ...theme.type.h2,
          color: theme.colors.textPrimary,
        },
      }),
    [insets.top, theme],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side}>{right}</View>
      </View>
    </View>
  );
}
