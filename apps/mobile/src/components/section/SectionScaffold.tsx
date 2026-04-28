import { type PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Heading, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{
  /** When true, skip the kicker / title / lead block (e.g. tab chrome lives in the native header). */
  hideHero?: boolean;
  kicker?: string;
  title?: string;
  /** Short supporting line; optional extra node under it */
  lead?: string;
  footer?: ReactNode;
  /**
   * When false, outer shell is a View (use when children include a list that scrolls,
   * e.g. FlatList, to avoid nested scroll views).
   */
  scrollable?: boolean;
  /**
   * Vertically center the content column when it is shorter than the screen (welcome, sign-in, pairing).
   * Horizontal centering of the max-width column always applies.
   */
  centerContent?: boolean;
}>;

const MAX_CONTENT_WIDTH = 600;

/**
 * Polished section shell: scrollable, responsive max width, consistent spacing.
 */
export function SectionScaffold({
  hideHero,
  kicker,
  title,
  lead,
  footer,
  children,
  scrollable = true,
  centerContent = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentW =
    width >= MAX_CONTENT_WIDTH + spacing.lg * 2 ? MAX_CONTENT_WIDTH : width - spacing.lg * 2;

  const header =
    hideHero ? null : (
      <View style={{ gap: spacing.xs }}>
        {kicker ? <Body>{kicker}</Body> : null}
        {title ? <Heading>{title}</Heading> : null}
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

  const scrollContentStyle = {
    paddingBottom: insets.bottom + spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    ...(centerContent ? { flexGrow: 1, justifyContent: 'center' as const } : {}),
  };

  const fixedOuterStyle = {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    paddingBottom: insets.bottom,
    ...(centerContent ? { justifyContent: 'center' as const } : {}),
  };

  return (
    <Screen padded={false}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={fixedOuterStyle}>
          {inner}
        </View>
      )}
    </Screen>
  );
}
