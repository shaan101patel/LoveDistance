import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        gap: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        backgroundColor: theme.colors.bg,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={{ color: theme.colors.textSecondary, ...theme.type.bodySm }}>{label}</Text>
    </View>
  );
}

export function StatusEmptyLine({ label }: { label: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>{label}</Text>;
}

export function ErrorState({ label }: { label: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.colors.danger, textAlign: 'center' }}>{label}</Text>;
}
