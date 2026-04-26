import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple } from '@/features/hooks';
import { useSessionStore } from '@/features/session/sessionStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function PairedSuccessScreen() {
  const { data: couple, isLoading } = useCouple();
  const returnPath = useSessionStore((s) => s.returnPath);
  const setReturnPath = useSessionStore((s) => s.setReturnPath);
  const theme = useTheme();
  const partnerName = couple?.partner.firstName ?? 'your partner';
  const reunionHint = couple?.reunionDate
    ? new Date(couple.reunionDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <SectionScaffold
      kicker="You’re set"
      lead="Mock data only—Supabase will persist this couple record and keep devices in sync."
      title={isLoading ? 'Linked' : `Connected with ${partnerName}`}
    >
      <SectionCard>
        {isLoading ? (
          <Body>Loading your couple…</Body>
        ) : (
          <>
            {reunionHint ? (
              <Text
                style={{
                  ...theme.type.bodySm,
                  color: theme.colors.textSecondary,
                  marginBottom: spacing.md,
                }}
              >
                Next reunion penciled for {reunionHint} (sample date from mock data).
              </Text>
            ) : null}
            <Button
              label="Go to your space"
              onPress={() => {
                const next =
                  returnPath && returnPath.startsWith('/(app)')
                    ? returnPath
                    : '/(app)/(tabs)/home';
                router.replace(next as Href);
                setReturnPath(null);
              }}
            />
          </>
        )}
      </SectionCard>
      <Text
        style={{ ...theme.type.bodySm, color: theme.colors.textSecondary, marginTop: spacing.md }}
      >
        Settings → Pairing & invites opens this flow again. While paired, new invites are blocked
        (same as a future server rule).
      </Text>
    </SectionScaffold>
  );
}
