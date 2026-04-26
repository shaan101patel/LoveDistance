import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useWeeklyRecapDraft } from '@/features/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

function RankingPlaceholderCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        backgroundColor: theme.colors.surfaceAlt,
        gap: spacing.sm,
      }}
    >
      <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary }}>{title}</Text>
      <Body>{body}</Body>
    </View>
  );
}

export default function WeeklyRecapSummaryScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ weekStartYmd?: string; ids?: string | string[] }>();
  const weekStartYmd = typeof params.weekStartYmd === 'string' ? params.weekStartYmd : '';
  const idsParam = useMemo(() => {
    const raw = params.ids;
    if (typeof raw === 'string') {
      return raw;
    }
    if (Array.isArray(raw)) {
      return raw[0] ?? '';
    }
    return '';
  }, [params.ids]);
  const selectedPhotoIds = useMemo(
    () => idsParam.split(',').map((s) => s.trim()).filter(Boolean),
    [idsParam],
  );

  const draft = useWeeklyRecapDraft(weekStartYmd, selectedPhotoIds);
  const data = draft.data;
  const missingParams = !weekStartYmd || selectedPhotoIds.length === 0;
  const showError = missingParams || draft.isError;

  return (
    <SectionScaffold
      kicker="Sunday recap"
      lead="A soft summary of what you chose—ranking highlights will appear here when the next version ships."
      title="Your week together"
    >
      {draft.isPending || draft.isFetching ? (
        <SectionCard>
          <Body>Composing your recap…</Body>
        </SectionCard>
      ) : showError ? (
        <SectionCard>
          <Body>We couldn’t build this recap. Go back and pick at least one photo.</Body>
        </SectionCard>
      ) : data ? (
        <View style={{ gap: spacing.lg }}>
          <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted }}>{data.week.label}</Text>
          <SectionCard>
            <Text style={{ ...theme.type.h2, color: theme.colors.textPrimary, marginBottom: spacing.sm }}>
              Your picks
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {data.selectedPhotos.map((p) => (
                <Image
                  key={p.id}
                  source={{ uri: p.imageUri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: radius.md,
                    backgroundColor: theme.colors.surfaceAlt,
                  }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          </SectionCard>

          <RankingPlaceholderCard
            title="Best question of the week"
            body="When ranking is ready, your standout prompt will land here—something that sparked the longest thread or the warmest replies."
          />
          <RankingPlaceholderCard
            title="Best response moment"
            body="Later, we’ll lift up a single answer or voice note that carried the most meaning. For now, enjoy the photos you chose."
          />

          {data.bestQuestion.status === 'ready' && data.bestQuestion.question ? (
            <SectionCard>
              <Text style={{ ...theme.type.body, color: theme.colors.textPrimary }}>{data.bestQuestion.question}</Text>
            </SectionCard>
          ) : null}
        </View>
      ) : null}
    </SectionScaffold>
  );
}
