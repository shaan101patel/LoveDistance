import { type ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

export type BottomNavItem = {
  key: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  icon: ReactNode;
};

type BottomNavProps = {
  items: BottomNavItem[];
  style?: ViewStyle;
};

/**
 * Composable bottom nav (not a replacement for Expo Router tabs).
 * Use in screens that need a custom tab strip or the design demo.
 */
export function BottomNav({ items, style }: BottomNavProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: 'row',
          backgroundColor: theme.colors.navBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.navBarBorder,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.xs,
          ...theme.shadows.bar,
        },
        item: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: spacing.xs,
          borderRadius: radius.md,
        },
        label: { fontSize: 11, marginTop: 2, fontWeight: '500' },
      }),
    [theme],
  );

  return (
    <View style={[styles.bar, style]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            item.active && { backgroundColor: theme.colors.surfaceAlt },
            pressed && { opacity: 0.85 },
          ]}
        >
          {item.icon}
          <Text
            style={[
              styles.label,
              { color: item.active ? theme.colors.tabActive : theme.colors.tabInactive },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
