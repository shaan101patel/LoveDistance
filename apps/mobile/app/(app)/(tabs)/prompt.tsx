import { useNavigation } from '@react-navigation/native';
import { router, type Href } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { TabHeaderTitle } from '@/components/navigation/TabHeaderTitle';
import { EmptyState } from '@/components/primitives';
import { Button } from '@/components/primitives/Button';
import { PremiumGate, PremiumUpsellBanner } from '@/components/premium';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useTodayPrompt } from '@/features/hooks';
import { isSupabaseApiMode, promptTabCopy } from '@/services/apiMode';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const PROMPT_TAB_SUBTITLE = 'One thoughtful question.';

export default function PromptTabScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const { data: thread, isLoading, isError } = useTodayPrompt();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <TabHeaderTitle title="Prompt" subtitle={PROMPT_TAB_SUBTITLE} />,
    });
  }, [navigation]);

  const openThreadHref =
    thread?.promptId != null ? (`/(app)/prompt/${thread.promptId}` as Href) : null;

  return (
    <SectionScaffold hideHero>
      <SectionCard>
        {isLoading ? (
          <View style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.md }}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Body>Loading today’s prompt…</Body>
          </View>
        ) : isError ? (
          <Body>We could not load your prompt. Open Home and try again shortly.</Body>
        ) : thread && openThreadHref ? (
          <View style={{ gap: spacing.md }}>
            <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted, fontWeight: '600' }}>
              Today
            </Text>
            <Text style={{ ...theme.type.body, color: theme.colors.textPrimary }}>{thread.question}</Text>
            <Button
              label={promptTabCopy.openThreadLinkLabel(live)}
              onPress={() => router.push(openThreadHref)}
            />
            <Pressable onPress={() => router.push('/(app)/(tabs)/home' as Href)}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Go to Home</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <EmptyState
              title={promptTabCopy.emptyTitle(live)}
              description={promptTabCopy.emptyDescription(live)}
            />
            <Pressable onPress={() => router.push('/(app)/(tabs)/home' as Href)} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Open Home</Text>
            </Pressable>
          </>
        )}
      </SectionCard>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted, fontWeight: '600' }}>
          Extra prompt packs
        </Text>
        <PremiumGate
          feature="extra_prompt_packs"
          fallback={
            <View style={{ gap: spacing.sm }}>
              <PremiumUpsellBanner
                message="Seasonal and long-distance packs—gentle add-ons, never required."
                onPress={() => router.push('/(app)/plus' as Href)}
              />
              <Body>Your daily prompt above stays exactly as it is for everyone.</Body>
            </View>
          }
        >
          <SectionCard>
            <Body>{promptTabCopy.plusUnlockedBody(live)}</Body>
          </SectionCard>
        </PremiumGate>
      </View>
    </SectionScaffold>
  );
}
