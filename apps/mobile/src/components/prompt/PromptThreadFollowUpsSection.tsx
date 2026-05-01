import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThreadReplyComposer, ThreadReplyList, VoiceNotePlaceholderCard } from '@/components/prompt';
import { Body, Heading, SectionCard } from '@/components/ui';
import { buildReplyTree } from '@/features/prompts/threadRepliesLayout';
import type { PromptThreadActivity } from '@/types/domain';
import { spacing } from '@/theme/tokens';

type Props = {
  meId: string;
  partnerName: string;
  /** When false (official answers not yet revealed), show a short visibility note. */
  isUnlockedPhase: boolean;
  activityLoading: boolean;
  threadActivity: PromptThreadActivity | null | undefined;
  replyRoots: ReturnType<typeof buildReplyTree>;
  replyReactionPending: boolean;
  onReact: (replyId: string, emoji: string) => void;
  onReply: (parentId: string) => void;
  addReplyPending: boolean;
  parentReplyId: string | null;
  onClearParent: () => void;
  prefillRevision: number;
  prefillText: string;
  onSubmitReply: (body: string, parentReplyId: string | null) => void;
  /** Optional slot above follow-ups (e.g. photo suggestion chips) — only when unlocked. */
  children?: ReactNode;
};

export function PromptThreadFollowUpsSection({
  meId,
  partnerName,
  isUnlockedPhase,
  activityLoading,
  threadActivity,
  replyRoots,
  replyReactionPending,
  onReact,
  onReply,
  addReplyPending,
  parentReplyId,
  onClearParent,
  prefillRevision,
  prefillText,
  onSubmitReply,
  children,
}: Props) {
  const placeholders = threadActivity?.voiceNotePlaceholders ?? [];

  return (
    <View style={{ gap: spacing.md }}>
      <Heading>Follow-ups:</Heading>
      {!isUnlockedPhase ? (
        <Body>
          Messages you send here are visible to both of you, even before your official daily answers
          unlock.
        </Body>
      ) : null}
      {children}
      {placeholders.map((slot) => (
        <VoiceNotePlaceholderCard key={slot.id} label={slot.label} />
      ))}
      {activityLoading ? (
        <Body>Loading conversation…</Body>
      ) : threadActivity ? (
        <>
          <ThreadReplyList
            meId={meId}
            partnerName={partnerName}
            replyReactionPending={replyReactionPending}
            roots={replyRoots}
            onReact={onReact}
            onReply={onReply}
          />
          <SectionCard>
            <ThreadReplyComposer
              isSubmitting={addReplyPending}
              parentReplyId={parentReplyId}
              prefillRevision={prefillRevision}
              prefillText={prefillText}
              onClearParent={onClearParent}
              onSubmit={onSubmitReply}
            />
          </SectionCard>
        </>
      ) : (
        <Body>Conversation could not be loaded.</Body>
      )}
    </View>
  );
}
