import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useMemo } from 'react';
import { Text, View } from 'react-native';

import { TabHeaderTitle } from '@/components/navigation/TabHeaderTitle';
import { Avatar } from '@/components/primitives';
import {
  DailyPromptCard,
  LatestSharedPhotoBlock,
  StreakPreviewPlaceholder,
  StoryHighlightsBlock,
} from '@/components/home';
import { ReunionCountdownCard } from '@/components/rituals';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import {
  useCouple,
  useCurrentUserId,
  useHabits,
  useHomeEngagementStreak,
  usePresenceFeed,
  useTodayPrompt,
} from '@/features/hooks';
import { composeHomeFeed } from '@/features/home/homeFeedComposer';
import { isMorningRitualCompleteForUser } from '@/features/rituals/morningRitual';
import { formatYmdLocal, toMonthKey } from '@/lib/calendarDates';
import { resolveUserTimeZone } from '@/lib/userTimeZone';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const HOME_TAB_SUBTITLE = "Today's question, shared presence, and small ritual";

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
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
  const partnerTimeZone = partner?.timeZone?.trim() || homeTimeZone;
  const streakQuery = useHomeEngagementStreak(thread?.date, homeTimeZone);
  const streakDaysForFeed = streakQuery.isSuccess
    ? streakQuery.data
    : streakQuery.isError
      ? 0
      : undefined;

  const homeFeed = useMemo(() => {
    if (!couple || !thread || !meId || streakDaysForFeed === undefined) {
      return null;
    }
    return composeHomeFeed({
      thread,
      meId,
      partnerId: couple.partner.id,
      partnerFirstName: couple.partner.firstName,
      morningRitualDone,
      currentStreakDays: streakDaysForFeed,
    });
  }, [couple, thread, meId, morningRitualDone, streakDaysForFeed]);

  const streakBlocking = Boolean(thread) && streakDaysForFeed === undefined;
  const showFeedSkeleton =
    Boolean(partner) &&
    (coupleLoading || sessionUserLoading || promptLoading || habitsLoading || streakBlocking);
  const dailyPromptAtBottom =
    homeFeed != null &&
    homeFeed.daily.state !== 'gated' &&
    homeFeed.daily.state !== 'unanswered';

  return (
    <SectionScaffold hideHero>
      {coupleLoading ? (
        <SectionCard>
          <Body>Loading your couple space…</Body>
        </SectionCard>
      ) : partner ? (
        <View style={{ gap: spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.sm,
            }}
          >
            <Avatar
              name={partner.firstName}
              size="sm"
              source={partner.avatarUrl ? { uri: partner.avatarUrl } : undefined}
            />
            <Text
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontWeight: '700',
                fontSize: 18,
              }}
            >
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
              {!dailyPromptAtBottom ? <DailyPromptCard daily={homeFeed.daily} /> : null}
              {presencePosts?.[0] ? (
                <LatestSharedPhotoBlock
                  meId={meId}
                  partnerFirstName={partner.firstName}
                  post={presencePosts[0]}
                />
              ) : null}
              <StoryHighlightsBlock />
              <StreakPreviewPlaceholder model={homeFeed.streak} />
              {dailyPromptAtBottom ? <DailyPromptCard daily={homeFeed.daily} /> : null}
            </View>
          ) : (
            <SectionCard>
              <Body>We’re missing your account link for today’s card. Re-open the app or sign in again.</Body>
            </SectionCard>
          )}
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
