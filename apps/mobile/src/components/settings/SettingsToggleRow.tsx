import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggleRow({ label, description, value, onValueChange, disabled }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        },
        textCol: { flex: 1, minWidth: 0 },
        label: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' },
        desc: { ...theme.type.caption, color: theme.colors.textSecondary, marginTop: spacing.xs },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={theme.colors.surface}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        value={value}
      />
    </View>
  );
}
