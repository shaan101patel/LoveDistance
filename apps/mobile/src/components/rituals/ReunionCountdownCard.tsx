import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ReunionDateEditModal } from '@/components/rituals/ReunionDateEditModal';
import { useUpdateReunionDates } from '@/features/hooks';
import {
  effectiveReunionEndIso,
  formatReunionInBothZones,
  formatYmdInTimeZone,
  partnerRelativeDaypart,
  reunionCountdownParts,
  reunionDateLabelInZone,
  reunionVisitPhase,
  visitCalendarDaysRemaining,
  ymdInZoneFromIso,
} from '@/features/rituals/ritualTimePresentation';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  reunionIso?: string;
  reunionEndIso?: string;
  partnerFirstName: string;
  homeTimeZone: string;
  partnerTimeZone: string;
};

function shortTzLabel(tz: string): string {
  return tz.replace(/_/g, ' ');
}

function rangeCaption(startIso: string, endIso: string | undefined, homeTz: string): string {
  const endEffective = effectiveReunionEndIso(startIso, endIso, homeTz);
  const a = reunionDateLabelInZone(startIso, homeTz);
  const b = reunionDateLabelInZone(endEffective, homeTz);
  return a === b ? a : `${a} → ${b}`;
}

export function ReunionCountdownCard({
  reunionIso,
  reunionEndIso,
  partnerFirstName,
  homeTimeZone,
  partnerTimeZone,
}: Props) {
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
          homeTimeZone={homeTimeZone}
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

  const phase = reunionVisitPhase(reunionIso, reunionEndIso, now, homeTimeZone);
  const parts = reunionCountdownParts(reunionIso, now);
  const dual = formatReunionInBothZones(reunionIso, homeTimeZone, partnerTimeZone);
  const daypart = partnerRelativeDaypart(now, partnerTimeZone);
  const endEffectiveIso = effectiveReunionEndIso(reunionIso, reunionEndIso, homeTimeZone);
  const isLastVisitDay =
    phase === 'together' &&
    formatYmdInTimeZone(now, homeTimeZone) === ymdInZoneFromIso(endEffectiveIso, homeTimeZone);
  const daysLeftInVisit =
    phase === 'together' ? visitCalendarDaysRemaining(now, endEffectiveIso, homeTimeZone) : 0;

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
            {rangeCaption(reunionIso, reunionEndIso, homeTimeZone)} · Tap to edit
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
              For {partnerFirstName}, it is {daypart} ({shortTzLabel(partnerTimeZone)}).
            </Text>
          </>
        ) : (
          <>
            <Text style={{ ...typeBase.h2, color: theme.colors.textPrimary }}>
              {parts.days}d {parts.hours}h to go
            </Text>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
              For {partnerFirstName}, it is {daypart} ({shortTzLabel(partnerTimeZone)}).
            </Text>
          </>
        )}
        <View style={{ marginTop: spacing.xs, gap: 2 }}>
          <Text style={{ ...typeBase.caption, color: theme.colors.textSecondary }}>{dual.meLine}</Text>
          <Text style={{ ...typeBase.caption, color: theme.colors.textSecondary }}>{dual.partnerLine}</Text>
          <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>
            Visit through {reunionDateLabelInZone(endEffectiveIso, homeTimeZone)} (your time,{' '}
            {shortTzLabel(homeTimeZone)})
          </Text>
        </View>
      </View>
      <ReunionDateEditModal
        visible={editorOpen}
        homeTimeZone={homeTimeZone}
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
