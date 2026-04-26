import { Text, View } from 'react-native';

import {
  MOCK_ME_TIME_ZONE,
  MOCK_PARTNER_TIME_ZONE,
  formatReunionInBothZones,
  partnerRelativeDaypart,
  reunionCountdownParts,
} from '@/features/rituals/ritualTimePresentation';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  reunionIso?: string;
  partnerFirstName: string;
};

export function ReunionCountdownCard({ reunionIso, partnerFirstName }: Props) {
  const theme = useTheme();
  const now = new Date();

  if (!reunionIso) {
    return (
      <View
        style={{
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: spacing.md,
        }}
      >
        <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
          Add a reunion date in settings when you are ready—then we will show a countdown here (mock).
        </Text>
      </View>
    );
  }

  const parts = reunionCountdownParts(reunionIso, now);
  const dual = formatReunionInBothZones(reunionIso, MOCK_ME_TIME_ZONE, MOCK_PARTNER_TIME_ZONE);
  const daypart = partnerRelativeDaypart(now, MOCK_PARTNER_TIME_ZONE);

  return (
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
      {parts.isPast ? (
        <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>
          That reunion date has passed in this sample—set a new one in Relationship settings.
        </Text>
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
      </View>
    </View>
  );
}
