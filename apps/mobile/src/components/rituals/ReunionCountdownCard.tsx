import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ReunionDateEditModal } from '@/components/rituals/ReunionDateEditModal';
import { useUpdateReunionDates } from '@/features/hooks';
import {
  MOCK_ME_TIME_ZONE,
  MOCK_PARTNER_TIME_ZONE,
  effectiveReunionEndIso,
  formatReunionInBothZones,
  localCalendarDateFromReunionIso,
  partnerRelativeDaypart,
  reunionCountdownParts,
  reunionVisitPhase,
  visitCalendarDaysRemaining,
} from '@/features/rituals/ritualTimePresentation';
import { formatYmdLocal } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  reunionIso?: string;
  reunionEndIso?: string;
  partnerFirstName: string;
};

function reunionDayLabel(iso: string): string {
  return localCalendarDateFromReunionIso(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function rangeCaption(startIso: string, endIso: string | undefined): string {
  const endEffective = effectiveReunionEndIso(startIso, endIso);
  const a = reunionDayLabel(startIso);
  const b = reunionDayLabel(endEffective);
  return a === b ? a : `${a} → ${b}`;
}

export function ReunionCountdownCard({ reunionIso, reunionEndIso, partnerFirstName }: Props) {
  const theme = useTheme();
  const now = new Date();
  const [editorOpen, setEditorOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateReunion = useUpdateReunionDates();

  const openEditor = () => {
    setSaveError(null);
    setEditorOpen(true);
  };

  if (!reunionIso) {
    return (
      <>
        <View
          style={{
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: spacing.md,
            gap: spacing.sm,
          }}
        >
          <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Reunion countdown</Text>
          <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
            Set start and end dates for your visit to see the countdown here.
          </Text>
          <Pressable onPress={openEditor} style={{ alignSelf: 'flex-start' }}>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.primary, fontWeight: '600' }}>
              Set reunion dates
            </Text>
          </Pressable>
        </View>
        <ReunionDateEditModal
          visible={editorOpen}
          initialReunionIso={undefined}
          initialReunionEndIso={undefined}
          canClear={false}
          onClose={() => {
            setEditorOpen(false);
            setSaveError(null);
          }}
          onSave={async (payload) => {
            setSaveError(null);
            try {
              await updateReunion.mutateAsync({
                reunionDate: payload.reunionDate,
                reunionEndDate: payload.reunionEndDate,
              });
              setEditorOpen(false);
            } catch (e) {
              setSaveError(e instanceof Error ? e.message : 'Could not save');
            }
          }}
          isSubmitting={updateReunion.isPending}
          errorText={saveError}
        />
      </>
    );
  }

  const phase = reunionVisitPhase(reunionIso, reunionEndIso, now);
  const parts = reunionCountdownParts(reunionIso, now);
  const dual = formatReunionInBothZones(reunionIso, MOCK_ME_TIME_ZONE, MOCK_PARTNER_TIME_ZONE);
  const daypart = partnerRelativeDaypart(now, MOCK_PARTNER_TIME_ZONE);
  const endEffectiveIso = effectiveReunionEndIso(reunionIso, reunionEndIso);
  const endDay = localCalendarDateFromReunionIso(endEffectiveIso);
  const isLastVisitDay =
    phase === 'together' && formatYmdLocal(now) === formatYmdLocal(endDay);
  const daysLeftInVisit =
    phase === 'together' ? visitCalendarDaysRemaining(now, endEffectiveIso) : 0;

  return (
    <>
      <View
        style={{
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Reunion countdown</Text>
        <Pressable onPress={openEditor} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
          <Text style={{ ...typeBase.bodySm, color: theme.colors.primary, fontWeight: '600' }}>
            {rangeCaption(reunionIso, reunionEndIso)} · Tap to edit
          </Text>
        </Pressable>
        {phase === 'ended' ? (
          <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>
            This reunion visit has ended—set new dates when you plan the next one.
          </Text>
        ) : phase === 'together' ? (
          <>
            <Text style={{ ...typeBase.h2, color: theme.colors.textPrimary }}>Together now</Text>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
              {isLastVisitDay
                ? 'Last day of your visit window — soak it in.'
                : `${daysLeftInVisit} day${daysLeftInVisit === 1 ? '' : 's'} left in your visit window.`}
            </Text>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
              For {partnerFirstName}, it is {daypart} (mock time zones: LA vs London).
            </Text>
          </>
        ) : (
          <>
            <Text style={{ ...typeBase.h2, color: theme.colors.textPrimary }}>
              {parts.days}d {parts.hours}h to go
            </Text>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
              For {partnerFirstName}, it is {daypart} (mock time zones: LA vs London).
            </Text>
          </>
        )}
        <View style={{ marginTop: spacing.xs, gap: 2 }}>
          <Text style={{ ...typeBase.caption, color: theme.colors.textSecondary }}>{dual.meLine}</Text>
          <Text style={{ ...typeBase.caption, color: theme.colors.textSecondary }}>{dual.partnerLine}</Text>
          <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>
            Visit through {reunionDayLabel(endEffectiveIso)} (your time)
          </Text>
        </View>
      </View>
      <ReunionDateEditModal
        visible={editorOpen}
        initialReunionIso={reunionIso}
        initialReunionEndIso={reunionEndIso}
        canClear
        onClose={() => {
          setEditorOpen(false);
          setSaveError(null);
        }}
        onSave={async (payload) => {
          setSaveError(null);
          try {
            await updateReunion.mutateAsync({
              reunionDate: payload.reunionDate,
              reunionEndDate: payload.reunionEndDate,
            });
            setEditorOpen(false);
          } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Could not save');
          }
        }}
        onClear={async () => {
          setSaveError(null);
          try {
            await updateReunion.mutateAsync({ reunionDate: null, reunionEndDate: null });
            setEditorOpen(false);
          } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Could not save');
          }
        }}
        isSubmitting={updateReunion.isPending}
        errorText={saveError}
      />
    </>
  );
}
