import { View } from 'react-native';

import { MeHeaderAvatarButton } from '@/components/navigation/MeHeaderAvatarButton';
import { NotificationBellPopover } from '@/components/navigation/NotificationBellPopover';
import { spacing } from '@/theme/tokens';

/** Tabs + in-app settings: notifications bell + profile avatar. Keep width in sync with `TabHeaderTitle` reserve. */
export function MeHeaderRightCluster() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginRight: 4 }}>
      <NotificationBellPopover />
      <MeHeaderAvatarButton trailingGutter={0} />
    </View>
  );
}
