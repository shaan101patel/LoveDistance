import { Text, View } from 'react-native';

import { Body } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  title: string;
  body: string;
};

/** Dashed outline card for “shipping with Plus” placeholders. */
export function PremiumPlaceholderCard({ title, body }: Props) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        backgroundColor: theme.colors.surfaceAlt,
        gap: spacing.sm,
      }}
    >
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>{title}</Text>
      <Body>{body}</Body>
    </View>
  );
}
