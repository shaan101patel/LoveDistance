import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { NotificationInboxBody } from '@/components/notifications';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Anchor = { x: number; y: number; width: number; height: number };

export function NotificationBellPopover() {
  const theme = useTheme();
  const services = useServices();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const bellRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });

  const openPopover = useCallback(() => {
    bellRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const onViewAll = useCallback(() => {
    close();
    router.push('/(app)/notifications' as Href);
  }, [close]);

  if (!session) {
    return null;
  }

  const cardMaxWidth = Math.min(360, windowWidth - spacing.lg * 2);
  const cardMaxHeight = Math.round(windowHeight * 0.52);
  const listMaxHeight = Math.max(160, cardMaxHeight - 120);

  const cardRight =
    anchor != null ? Math.max(spacing.sm, windowWidth - anchor.x - anchor.width) : spacing.sm;
  const cardTop = anchor != null ? anchor.y + anchor.height + 6 : spacing.xxl;

  return (
    <>
      <View ref={bellRef} collapsable={false}>
        <Pressable
          accessibilityLabel="Notifications"
          hitSlop={8}
          onPress={openPopover}
          style={{ paddingHorizontal: spacing.xs }}
        >
          <FontAwesome color={theme.colors.textPrimary} name="bell" size={20} />
        </Pressable>
      </View>

      <Modal transparent animationType="fade" visible={open} onRequestClose={close}>
        <View style={styles.root} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            onPress={close}
          />
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: cardTop,
              right: cardRight,
              maxWidth: cardMaxWidth,
              width: cardMaxWidth,
              maxHeight: cardMaxHeight,
              backgroundColor: theme.colors.surface,
              borderRadius: radius.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.colors.border,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text style={{ ...typeBase.h2, fontSize: 16, color: theme.colors.textPrimary }}>
                Notifications
              </Text>
            </View>
            <NotificationInboxBody
              variant="peek"
              listMaxHeight={listMaxHeight}
              onViewAllPress={onViewAll}
              onNavigateFromRow={close}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
