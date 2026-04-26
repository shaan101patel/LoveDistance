import { type PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Heading, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{
  kicker: string;
  title: string;
  /** Short supporting line; optional extra node under it */
  lead?: string;
  footer?: ReactNode;
  /**
   * When false, outer shell is a View (use when children include a list that scrolls,
   * e.g. FlatList, to avoid nested scroll views).
   */
  scrollable?: boolean;
}>;

const MAX_CONTENT_WIDTH = 600;

/**
 * Polished section shell: scrollable, responsive max width, consistent spacing.
 */
export function SectionScaffold({ kicker, title, lead, footer, children, scrollable = true }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentW =
    width >= MAX_CONTENT_WIDTH + spacing.lg * 2 ? MAX_CONTENT_WIDTH : width - spacing.lg * 2;

  const header = (
    <View style={{ gap: spacing.xs }}>
      <Body>{kicker}</Body>
      <Heading>{title}</Heading>
      {lead ? <Body>{lead}</Body> : null}
    </View>
  );

  const inner = (
    <View
      style={{
        width: contentW,
        maxWidth: '100%' as const,
        gap: spacing.md,
        paddingTop: spacing.sm,
        flex: scrollable ? undefined : 1,
      }}
    >
      {header}
      {children}
      {footer ? <View style={{ marginTop: spacing.lg }}>{footer}</View> : null}
    </View>
  );

  return (
    <Screen padded={false}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
            paddingBottom: insets.bottom,
          }}
        >
          {inner}
        </View>
      )}
    </Screen>
  );
}
