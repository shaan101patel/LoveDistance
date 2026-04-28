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
        centerContent
        footer={<Body>{pairingScreenCopy.pairingHubPairedFooter(live)}</Body>}
        hideHero
      >
        <View style={{ marginBottom: spacing.md }}>
          <Body>{pairingScreenCopy.pairingHubPairedLead(live)}</Body>
        </View>
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
      centerContent
      footer={
        <Text style={{ ...theme.type.bodySm, color: theme.colors.textSecondary }}>
          {pairingScreenCopy.pairingHubUnpairedFooter(live)}
        </Text>
      }
      hideHero
    >
      <View style={{ marginBottom: spacing.md }}>
        <Body>
          One of you creates an invite; the other joins with the link or code. On one phone: generate
          a link, copy the code, then use &quot;I have an invite code&quot;.
        </Body>
      </View>
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
