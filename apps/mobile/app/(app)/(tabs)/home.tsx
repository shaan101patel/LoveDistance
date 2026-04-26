import { useQueryClient } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/primitives';
import {
  DailyPromptCard,
  LatestSharedPhotoBlock,
  PartnerActivitySection,
  StreakPreviewPlaceholder,
} from '@/components/home';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple, useCurrentUserId, usePresenceFeed, useTodayPrompt } from '@/features/hooks';
import { composeHomeFeed } from '@/features/home/homeFeedComposer';
import {
  devSimulatePartnerTodayAnswer,
  devSimulatePartnerTodayReaction,
} from '@/services/mock/mockDevHelpers';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const quickLinks: { href: Href; label: string; hint: string }[] = [
  { href: '/(app)/(tabs)/photos', label: 'Photos', hint: 'Shared presence' },
  { href: '/(app)/(tabs)/calendar', label: 'Calendar', hint: 'Habits & time' },
  { href: '/(app)/(tabs)/settings', label: 'Settings', hint: 'You & the app' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: couple, isLoading: coupleLoading } = useCouple();
  const { data: thread, isLoading: promptLoading, isError: promptError } = useTodayPrompt();
  const { data: presencePosts } = usePresenceFeed();
  const { meId, isSessionLoading: sessionUserLoading } = useCurrentUserId();
  const partner = couple?.partner;
  const reunion = couple?.reunionDate
    ? new Date(couple.reunionDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const homeFeed = useMemo(() => {
    if (!couple || !thread || !meId) {
      return null;
    }
    return composeHomeFeed({
      thread,
      meId,
      partnerId: couple.partner.id,
      partnerFirstName: couple.partner.firstName,
    });
  }, [couple, thread, meId]);

  const showFeedSkeleton =
    Boolean(partner) && (coupleLoading || sessionUserLoading || promptLoading);

  return (
    <SectionScaffold
      kicker="Your space"
      lead="A calm home for today’s question, shared presence, and the small rituals that keep you close."
      title="Home"
    >
      {coupleLoading ? (
        <SectionCard>
          <Body>Loading your couple space…</Body>
        </SectionCard>
      ) : partner ? (
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 18 }}>
              Paired with {partner.firstName}
              {partner.displayName && partner.displayName !== partner.firstName
                ? ` (${partner.displayName})`
                : ''}
            </Text>
            {reunion ? <Body>Next reunion (sample): {reunion}</Body> : null}
          </View>

          {showFeedSkeleton ? (
            <SectionCard>
              <Body>Loading today’s prompt…</Body>
            </SectionCard>
          ) : promptError ? (
            <SectionCard>
              <Body>We couldn’t load your daily prompt. Pull to refresh or try again in a moment.</Body>
            </SectionCard>
          ) : homeFeed && thread && meId ? (
            <View style={{ gap: spacing.lg }}>
              <DailyPromptCard daily={homeFeed.daily} />
              {presencePosts?.[0] ? (
                <LatestSharedPhotoBlock
                  meId={meId}
                  partnerFirstName={partner.firstName}
                  post={presencePosts[0]}
                />
              ) : null}
              <PartnerActivitySection model={homeFeed.partnerActivity} />
              <StreakPreviewPlaceholder model={homeFeed.streak} />
            </View>
          ) : (
            <SectionCard>
              <Body>We’re missing your account link for today’s card. Re-open the app or sign in again.</Body>
            </SectionCard>
          )}

          {__DEV__ && partner && thread && meId ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: spacing.md,
                gap: spacing.sm,
                backgroundColor: theme.colors.surfaceAlt,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>
                Mock (dev only)
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Pressable
                  onPress={() => {
                    devSimulatePartnerTodayAnswer();
                    void queryClient.invalidateQueries({ queryKey: ['prompt', 'today'] });
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                    Partner answers today
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    devSimulatePartnerTodayReaction();
                    void queryClient.invalidateQueries({ queryKey: ['prompt', 'today'] });
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                    Partner reacts
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              justifyContent: 'flex-start',
            }}
          >
            {quickLinks.map((item) => (
              <Link key={item.label} asChild href={item.href}>
                <Pressable style={{ flexGrow: 1, minWidth: 120, maxWidth: 200 }}>
                  <Card elevated={false} style={{ padding: spacing.md }}>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
                      {item.label}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                      {item.hint}
                    </Text>
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ) : (
        <SectionCard>
          <Body>
            You are not linked yet. If you see this, head back to pairing from the app entry
            (redirect should normally keep you in onboarding).
          </Body>
        </SectionCard>
      )}
    </SectionScaffold>
  );
}
