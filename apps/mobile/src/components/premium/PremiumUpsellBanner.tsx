import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  message: string;
  ctaLabel?: string;
  onPress?: () => void;
};

/** Single compact upsell row; keep copy short and calm. */
export function PremiumUpsellBanner({ message, ctaLabel = 'Learn more', onPress }: Props) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ ...theme.type.bodySm, color: theme.colors.textSecondary, flex: 1 }}>{message}</Text>
      {onPress ? (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text style={{ ...theme.type.bodySm, color: theme.colors.primary, fontWeight: '600' }}>
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
