import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/primitives/Button';
import {
  PartnerAnswerPanel,
  PhotoFollowUpSuggestions,
  PromptAnswerComposer,
  PromptCategoryChip,
  ThreadReplyComposer,
  ThreadReplyList,
  UnlockedAnswerCard,
  VoiceNotePlaceholderCard,
} from '@/components/prompt';
import { Body, Heading, SectionCard, Screen } from '@/components/ui';
import {
  useAddThreadReply,
  useCouple,
  useCurrentUserId,
  useHabits,
  usePromptReaction,
  usePromptThread,
  useReactToThreadReply,
  useSubmitPrompt,
  useThreadActivity,
} from '@/features/hooks';
import { buildReplyTree } from '@/features/prompts/threadRepliesLayout';
import { buildPromptThreadViewModel } from '@/features/prompts/threadViewModel';
import { isMorningRitualCompleteForUser } from '@/features/rituals/morningRitual';
import { formatYmdLocal, toMonthKey } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const HEART_EMOJI = '❤️';

function parsePromptId(raw: string | string[] | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }
  return typeof raw === 'string' ? raw : raw[0];
}

export default function PromptThreadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const promptId = parsePromptId(useLocalSearchParams<{ promptId: string }>().promptId);
  const { data: couple } = useCouple();
  const { meId } = useCurrentUserId();
  const { data: thread, isLoading, isError, isSuccess } = usePromptThread(promptId);
  const monthKey = toMonthKey(new Date());
  const { data: habits, isLoading: habitsLoading } = useHabits(monthKey);
  const todayYmd = formatYmdLocal(new Date());
  const submit = useSubmitPrompt();
  const promptReaction = usePromptReaction();
  const addThreadReply = useAddThreadReply();
  const threadReplyReact = useReactToThreadReply();
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyInject, setReplyInject] = useState<{ rev: number; text: string }>({ rev: 0, text: '' });

  const partner = couple?.partner;
  const partnerId = partner?.id;
  const partnerName = partner?.firstName ?? 'Partner';

  const vm = useMemo(() => {
    if (!thread || !meId || !partnerId) {
      return null;
    }
    return buildPromptThreadViewModel({
      thread,
      meId,
      partnerId,
      partnerFirstName: partnerName,
    });
  }, [thread, meId, partnerId, partnerName]);

  const { data: threadActivity, isLoading: activityLoading } = useThreadActivity(promptId, {
    enabled: vm?.phase === 'unlocked',
  });

  const replyRoots = useMemo(
    () => (threadActivity?.replies.length ? buildReplyTree(threadActivity.replies) : []),
    [threadActivity],
  );

  const needsMorningGate = Boolean(
    vm &&
      vm.phase === 'awaitingMyAnswer' &&
      meId != null &&
      !habitsLoading &&
      !isMorningRitualCompleteForUser(habits, meId, todayYmd),
  );
  const morningGateLoading = Boolean(
    vm && vm.phase === 'awaitingMyAnswer' && meId && habitsLoading,
  );
  const useGateStyleHeading = Boolean(needsMorningGate || morningGateLoading);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: { flex: 1, justifyContent: 'center' as const, padding: spacing.lg, gap: spacing.md },
        back: { color: theme.colors.primary, fontWeight: '600' as const, fontSize: 16, marginTop: spacing.md },
        myLabel: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
      }),
    [theme],
  );

  if (promptId == null || promptId === '') {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Missing prompt. Go back and open a prompt from Home.</Body>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator accessibilityLabel="Loading prompt" size="large" color={theme.colors.primary} />
          <Body>Loading this prompt…</Body>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>We couldn’t load this prompt. Check your connection and try again.</Body>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (isSuccess && thread === null) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>We can’t find a prompt with that id. It may have ended or the link is wrong.</Body>
          <Pressable onPress={() => router.push('/(app)/(tabs)/home' as Href)}>
            <Text style={styles.back}>Back to Home</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (!couple || !meId || !partnerId) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Pairing data isn’t available. Open the app from a signed-in, paired session.</Body>
        </View>
      </Screen>
    );
  }

  if (thread == null) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Loading this prompt…</Body>
        </View>
      </Screen>
    );
  }

  if (vm == null) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Could not build this view. Try again.</Body>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {vm.category && !useGateStyleHeading ? <PromptCategoryChip label={vm.category.label} /> : null}
        <View style={{ gap: spacing.xs }}>
          {useGateStyleHeading ? (
            <>
              <Heading>
                {morningGateLoading
                  ? 'Almost there…'
                  : 'Your question unlocks after a quick check-in'}
              </Heading>
              <Body>
                {morningGateLoading
                  ? 'Checking your morning habit in the app…'
                  : 'Same small morning ritual you use on Home: tap below, then you can read and answer today’s prompt. Your partner can still be asleep in another time zone.'}
              </Body>
            </>
          ) : (
            <>
              <Heading>{vm.question}</Heading>
              <Text style={styles.myLabel} accessibilityLabel="Prompt date">
                {thread.date}
              </Text>
            </>
          )}
        </View>

        {vm.phase === 'unlocked' ? (
          <>
            <UnlockedAnswerCard
              doubleTapHeartDisabled={promptReaction.isPending}
              heading="You"
              imageUri={vm.myAnswer.imageUri}
              submittedAt={vm.myAnswer.submittedAt}
              text={vm.myAnswer.answer}
              onDoubleTapHeart={() =>
                promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
              }
            />
            <UnlockedAnswerCard
              doubleTapHeartDisabled={promptReaction.isPending}
              heading={partnerName}
              imageUri={vm.partnerAnswer.imageUri}
              submittedAt={vm.partnerAnswer.submittedAt}
              text={vm.partnerAnswer.answer}
              onDoubleTapHeart={() =>
                promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
              }
            />
            {vm.partnerAnswer.imageUri ? (
              <PhotoFollowUpSuggestions
                imageUri={vm.partnerAnswer.imageUri}
                partnerName={partnerName}
                promptQuestion={vm.question}
                onSelectLine={(line) => {
                  setReplyInject((s) => ({ rev: s.rev + 1, text: line }));
                }}
              />
            ) : null}

            <View style={{ gap: spacing.md }}>
              <Heading>Follow-ups</Heading>
              <Body>Chat below is separate from your official daily answers—great for quick continuations.</Body>
              {threadActivity?.voiceNotePlaceholders.map((slot) => (
                <VoiceNotePlaceholderCard key={slot.id} label={slot.label} />
              ))}
              {activityLoading ? (
                <Body>Loading conversation…</Body>
              ) : threadActivity ? (
                <>
                  <ThreadReplyList
                    meId={meId}
                    partnerName={partnerName}
                    replyReactionPending={threadReplyReact.isPending}
                    roots={replyRoots}
                    onReact={(replyId, emoji) =>
                      threadReplyReact.mutate({
                        promptId: thread.promptId,
                        replyId,
                        emoji,
                      })
                    }
                    onReply={(parentId) => setReplyParentId(parentId)}
                  />
                  <SectionCard>
                    <ThreadReplyComposer
                      isSubmitting={addThreadReply.isPending}
                      parentReplyId={replyParentId}
                      prefillRevision={replyInject.rev}
                      prefillText={replyInject.text}
                      onClearParent={() => setReplyParentId(null)}
                      onSubmit={(body, parentId) => {
                        addThreadReply.mutate(
                          { promptId: thread.promptId, body, parentReplyId: parentId },
                          {
                            onSuccess: () => setReplyParentId(null),
                          },
                        );
                      }}
                    />
                  </SectionCard>
                </>
              ) : (
                <Body>Conversation could not be loaded.</Body>
              )}
            </View>
          </>
        ) : null}

        {vm.phase === 'awaitingMyAnswer' && morningGateLoading ? (
          <SectionCard>
            <ActivityIndicator color={theme.colors.primary} size="large" accessibilityLabel="Loading" />
          </SectionCard>
        ) : null}

        {vm.phase === 'awaitingMyAnswer' && needsMorningGate ? (
          <SectionCard>
            <Text style={styles.myLabel}>Step 1</Text>
            <Button
              label="Morning check-in"
              onPress={() => router.push('/(app)/wake-check-in' as Href)}
            />
            <View style={{ marginTop: spacing.md }}>
              <PartnerAnswerPanel
                doubleTapHeartDisabled={promptReaction.isPending}
                row={vm.partnerRow}
                title={partnerName === 'Partner' ? "Partner's space" : `${partnerName}’s answer`}
                onDoubleTapHeart={() =>
                  promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
                }
              />
            </View>
          </SectionCard>
        ) : null}

        {vm.phase === 'awaitingMyAnswer' && !needsMorningGate && !morningGateLoading ? (
          <>
            <SectionCard>
              <Text style={styles.myLabel}>Your answer</Text>
              <PromptAnswerComposer
                isSubmitting={submit.isPending}
                onSubmit={({ answer, imageUri: uri }) =>
                  submit.mutate({ promptId: vm.promptId, answer, imageUri: uri })
                }
              />
            </SectionCard>
            <PartnerAnswerPanel
              doubleTapHeartDisabled={promptReaction.isPending}
              row={vm.partnerRow}
              title={partnerName === 'Partner' ? "Partner's space" : `${partnerName}’s answer`}
              onDoubleTapHeart={() =>
                promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
              }
            />
          </>
        ) : null}

        {vm.phase === 'awaitingPartner' ? (
          <>
            <UnlockedAnswerCard
              doubleTapHeartDisabled={promptReaction.isPending}
              heading="You"
              imageUri={vm.myAnswer.imageUri}
              submittedAt={vm.myAnswer.submittedAt}
              text={vm.myAnswer.answer}
              onDoubleTapHeart={() =>
                promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
              }
            />
            <PartnerAnswerPanel
              doubleTapHeartDisabled={promptReaction.isPending}
              row={vm.partnerRow}
              title={partnerName === 'Partner' ? "Partner's space" : `${partnerName}’s answer`}
              onDoubleTapHeart={() =>
                promptReaction.mutate({ promptId: thread.promptId, emoji: HEART_EMOJI })
              }
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
