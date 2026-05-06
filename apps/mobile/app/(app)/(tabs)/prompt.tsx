import { useNavigation } from '@react-navigation/native';
import { router, type Href } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { TabHeaderTitle } from '@/components/navigation/TabHeaderTitle';
import { EmptyState } from '@/components/primitives';
import { Button } from '@/components/primitives/Button';
import { PromptTabExtraModes } from '@/components/promptTab';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { usePrivacySettings, useTodayPrompt } from '@/features/hooks';
import { isSupabaseApiMode, promptTabCopy } from '@/services/apiMode';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const PROMPT_TAB_SUBTITLE = 'One thoughtful question.';

export default function PromptTabScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const { data: thread, isLoading, isError } = useTodayPrompt();
  const privacyQuery = usePrivacySettings();
  const allowNsfw = privacyQuery.query.data?.allowNsfwPrompts ?? false;

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
            <PromptTabExtraModes allowNsfw={allowNsfw} promptId={thread.promptId} />
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
    </SectionScaffold>
  );
}
