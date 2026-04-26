import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
  description?: string;
  onPress: () => void;
  hint?: string;
};

export function SettingsLinkRow({ label, description, onPress, hint = '›' }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          paddingVertical: spacing.xs,
        },
        textCol: { flex: 1, minWidth: 0 },
        label: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' },
        desc: { ...theme.type.caption, color: theme.colors.textSecondary, marginTop: spacing.xs },
        hint: { ...theme.type.body, color: theme.colors.textMuted, fontSize: 20 },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
    >
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
      <Text style={styles.hint}>{hint}</Text>
    </Pressable>
  );
}
