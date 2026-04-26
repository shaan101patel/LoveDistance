import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { RecapPhotoPickRow } from '@/components/weeklyRecap';
import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useWeeklyRecapCandidates } from '@/features/hooks';
import { getWeekRangeLabelParts } from '@/lib/calendarDates';
import { spacing } from '@/theme/tokens';

const MAX_PICK = 5;

export default function WeeklyRecapSelectScreen() {
  const anchorIso = useMemo(() => new Date().toISOString(), []);
  const week = useMemo(() => getWeekRangeLabelParts(new Date()), []);
  const { data: candidates, isLoading, isError } = useWeeklyRecapCandidates(anchorIso);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_PICK) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const selectionLocked = selectedIds.length >= MAX_PICK;
  const onContinue = useCallback(() => {
    const q = new URLSearchParams({
      weekStartYmd: week.weekStartYmd,
      ids: selectedIds.join(','),
    }).toString();
    router.push(`/(app)/weekly-recap/summary?${q}` as Href);
  }, [selectedIds, week.weekStartYmd]);

  return (
    <SectionScaffold
      kicker="Sunday recap"
      lead={`Moments from ${week.label} (Mon–Sun, local). Pick up to ${MAX_PICK} photos you want in this week’s story.`}
      title="Choose photos"
    >
      {isLoading ? (
        <SectionCard>
          <Body>Loading this week’s shared photos…</Body>
        </SectionCard>
      ) : isError ? (
        <SectionCard>
          <Body>We couldn’t load recap picks. Try again shortly.</Body>
        </SectionCard>
      ) : !candidates?.length ? (
        <SectionCard>
          <Body>No shared photos landed in this window yet. Share a few from Photos, then come back.</Body>
        </SectionCard>
      ) : (
        <View style={{ gap: spacing.md }}>
          <Body>
            Tap up to {MAX_PICK} moments—they’ll appear on your recap card. You can change this flow
            anytime; nothing is sent to a server yet.
          </Body>
          <View style={{ gap: spacing.sm }}>
            {candidates.map((post) => (
              <RecapPhotoPickRow
                key={post.id}
                post={post}
                selected={selectedIds.includes(post.id)}
                selectionLocked={selectionLocked}
                onToggle={toggle}
              />
            ))}
          </View>
          <Button label="Continue" disabled={selectedIds.length === 0} onPress={onContinue} />
        </View>
      )}
    </SectionScaffold>
  );
}
