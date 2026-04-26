import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/primitives/Card';
import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  label: string;
};

/**
 * Non-functional placeholder until recording and upload are implemented.
 */
export function VoiceNotePlaceholderCard({ label }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        copy: { flex: 1, gap: 4 },
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' as const },
        sub: { ...theme.type.caption, color: theme.colors.textMuted },
        icon: { opacity: 0.5 },
      }),
    [theme],
  );
  return (
    <Pressable
      accessibilityLabel="Voice note not available"
      disabled
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Card elevated={false} style={styles.row}>
        <FontAwesome
          name="microphone"
          size={24}
          color={theme.colors.textSecondary}
          style={styles.icon}
        />
        <View style={styles.copy}>
          <Text style={styles.title}>{label}</Text>
          <Body>Voice messages are not available in this build—text follow-ups are below.</Body>
        </View>
      </Card>
    </Pressable>
  );
}
