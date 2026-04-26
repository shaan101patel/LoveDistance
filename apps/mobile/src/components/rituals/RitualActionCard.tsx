import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function RitualActionCard({ emoji, title, subtitle, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          minWidth: 140,
          maxWidth: 200,
          padding: spacing.md,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: 22, marginBottom: spacing.xs }}>{emoji}</Text>
      <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>{title}</Text>
      <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, marginTop: 4 }} numberOfLines={3}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
