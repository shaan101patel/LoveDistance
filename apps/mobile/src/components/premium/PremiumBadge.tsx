import { Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

/** Small inline “Plus” chip for settings rows or section headers. */
export function PremiumBadge() {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ ...theme.type.caption, color: theme.colors.textMuted, fontSize: 10, fontWeight: '600' }}>
        Plus
      </Text>
    </View>
  );
}
