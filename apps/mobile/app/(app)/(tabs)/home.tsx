import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TabHeaderTitle } from '@/components/navigation/TabHeaderTitle';
import { Card } from '@/components/primitives';
import {
  DailyPromptCard,
  LatestSharedPhotoBlock,
  PartnerActivitySection,
  StreakPreviewPlaceholder,
  StoryHighlightsBlock,
} from '@/components/home';
import { ReunionCountdownCard } from '@/components/rituals';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple, useCurrentUserId, useHabits, usePresenceFeed, useTodayPrompt } from '@/features/hooks';
import { composeHomeFeed } from '@/features/home/homeFeedComposer';
import { MOCK_PARTNER_TIME_ZONE } from '@/features/rituals/ritualTimePresentation';
import { isMorningRitualCompleteForUser } from '@/features/rituals/morningRitual';
import { formatYmdLocal, toMonthKey } from '@/lib/calendarDates';
import { resolveUserTimeZone } from '@/lib/userTimeZone';
import { useServices } from '@/services/ServiceContext';
import {
  devSimulatePartnerTodayAnswer,
  devSimulatePartnerTodayReaction,
} from '@/services/mock/mockDevHelpers';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const quickLinks: { href: Href; label: string; hint: string }[] = [
  { href: '/(app)/(tabs)/photos', label: 'Photos', hint: 'Shared presence' },
  { href: '/(app)/(tabs)/calendar', label: 'Calendar', hint: 'Habits & time' },
  {
    href: '/(app)/relationship-dashboard' as Href,
    label: 'Rhythm',
    hint: 'Warm trends from your time together (mock)',
  },
  {
    href: '/(app)/weekly-recap/select' as Href,
    label: 'Recap',
    hint: 'Pick up to five photos for your week (mock)',
  },
  { href: '/(app)/notifications' as Href, label: 'Alerts', hint: 'Notification center (mock)' },
];

const HOME_TAB_SUBTITLE = "Today's question, shared presence, and small ritual";

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const services = useServices();
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <TabHeaderTitle title="Home" subtitle={HOME_TAB_SUBTITLE} />,
    });
  }, [navigation]);
  const { data: couple, isLoading: coupleLoading } = useCouple();
  const { data: thread, isLoading: promptLoading, isError: promptError } = useTodayPrompt();
  const { data: presencePosts } = usePresenceFeed();
  const { meId, isSessionLoading: sessionUserLoading } = useCurrentUserId();
  const monthKey = toMonthKey(new Date());
  const { data: habits, isLoading: habitsLoading } = useHabits(monthKey);
  const todayYmd = formatYmdLocal(new Date());
  const morningRitualDone = Boolean(
    meId && isMorningRitualCompleteForUser(habits, meId, todayYmd),
  );
  const partner = couple?.partner;
  const homeTimeZone = resolveUserTimeZone(session?.user.timeZone);
  const partnerTimeZone = partner?.timeZone?.trim() || MOCK_PARTNER_TIME_ZONE;

  const homeFeed = useMemo(() => {
    if (!couple || !thread || !meId) {
      return null;
    }
    return composeHomeFeed({
      thread,
      meId,
      partnerId: couple.partner.id,
      partnerFirstName: couple.partner.firstName,
      morningRitualDone,
    });
  }, [couple, thread, meId, morningRitualDone]);

  const showFeedSkeleton =
    Boolean(partner) && (coupleLoading || sessionUserLoading || promptLoading || habitsLoading);

  return (
    <SectionScaffold hideHero>
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
              <ReunionCountdownCard
                reunionIso={couple.reunionDate}
                reunionEndIso={couple.reunionEndDate}
                partnerFirstName={partner.firstName}
                homeTimeZone={homeTimeZone}
                partnerTimeZone={partnerTimeZone}
              />
              <DailyPromptCard daily={homeFeed.daily} />
              {presencePosts?.[0] ? (
                <LatestSharedPhotoBlock
                  meId={meId}
                  partnerFirstName={partner.firstName}
                  post={presencePosts[0]}
                />
              ) : null}
              <StoryHighlightsBlock />
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
