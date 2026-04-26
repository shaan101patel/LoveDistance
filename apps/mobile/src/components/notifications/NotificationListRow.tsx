import { Pressable, Text, View } from 'react-native';

import type { NotificationInboxItem } from '@/types/domain';
import { formatNotificationRelativeTime } from '@/features/notifications/inboxLabels';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

type Props = {
  item: NotificationInboxItem;
  onPress: () => void;
};

export function NotificationListRow({ item, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginTop: 6,
            backgroundColor: item.read ? 'transparent' : theme.colors.primary,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>
            {item.title}
          </Text>
          <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary, marginTop: 4 }}>
            {item.summary}
          </Text>
          <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, marginTop: 6 }}>
            {formatNotificationRelativeTime(item.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
