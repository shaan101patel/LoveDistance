import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSessionStore } from '@/features/session/sessionStore';
import { isSupabaseApiMode, pairingScreenCopy } from '@/services/apiMode';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function PairingHubScreen() {
  const theme = useTheme();
  const isPaired = useSessionStore((s) => s.isPaired);
  const live = isSupabaseApiMode();

  if (isPaired) {
    return (
      <SectionScaffold
        footer={<Body>{pairingScreenCopy.pairingHubPairedFooter(live)}</Body>}
        kicker="Together"
        lead={pairingScreenCopy.pairingHubPairedLead(live)}
        title="You’re paired"
      >
        <SectionCard>
          <Body>{pairingScreenCopy.pairingHubPairedCardBody(live)}</Body>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            <Button label="Open home" onPress={() => router.replace('/(app)/(tabs)/home')} />
            <Button
              label="Pairing & deep links (help)"
              onPress={() => router.push('/(onboarding)/pairing/enter-code')}
              variant="secondary"
            />
          </View>
        </SectionCard>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      footer={
        <Text style={{ ...theme.type.bodySm, color: theme.colors.textSecondary }}>
          {pairingScreenCopy.pairingHubUnpairedFooter(live)}
        </Text>
      }
      kicker="Together"
      lead='One of you creates an invite; the other joins with the link or code. On one phone: generate a link, copy the code, then use "I have an invite code".'
      title="Link with your partner"
    >
      <SectionCard>
        <View style={{ gap: spacing.md }}>
          <Button
            label="Create an invite link"
            onPress={() => router.push('/(onboarding)/pairing/create-invite')}
          />
          <Button
            label="I have an invite code"
            onPress={() => router.push('/(onboarding)/pairing/enter-code')}
            variant="secondary"
          />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
