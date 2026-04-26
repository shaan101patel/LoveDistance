import { Text, View } from 'react-native';

import type { NotificationCategory } from '@/types/domain';
import { notificationCategoryTitle } from '@/features/notifications/inboxLabels';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

type Props = {
  category: NotificationCategory;
};

export function NotificationCategoryHeader({ category }: Props) {
  const theme = useTheme();
  return (
    <View style={{ paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
      <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, fontWeight: '600' }}>
        {notificationCategoryTitle(category)}
      </Text>
    </View>
  );
}
