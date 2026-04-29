import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle: string;
};

/** Space reserved for `headerRight` (bell + avatar + margins); keep in sync with MeHeaderRightCluster. */
const AVATAR_HEADER_RESERVE = 92;
/** Opaque strip so the centered subtitle can run full width without showing through the title. */
const TITLE_OVERLAY_MAX_WIDTH = 120;

/**
 * Tab header: title on the left, single-line subtitle centered in the full bar (minus avatar),
 * avatar stays `headerRight`. Uses window width because the native title slot often shrink-wraps
 * and collapses flex-based “middle column” layouts.
 */
export function TabHeaderTitle({ title, subtitle }: Props) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const slotWidth = Math.max(0, windowWidth - AVATAR_HEADER_RESERVE);

  return (
    <View
      style={{
        width: slotWidth,
        maxWidth: '100%',
        minHeight: 44,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      {/* Full-slot centered subtitle (single line, uses real bar width) */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', paddingHorizontal: spacing.sm }]}
      >
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{
            ...theme.type.bodySm,
            fontSize: 12,
            fontStyle: 'italic',
            color: theme.colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      </View>
      {/* Title above subtitle on the left */}
      <View
        style={{
          zIndex: 2,
          alignSelf: 'flex-start',
          maxWidth: TITLE_OVERLAY_MAX_WIDTH,
          paddingVertical: spacing.sm,
          paddingRight: spacing.sm,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={{
            ...theme.type.h2,
            fontSize: 17,
            fontWeight: '600',
            color: theme.colors.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
