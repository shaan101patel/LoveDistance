import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSessionStore } from '@/features/session/sessionStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function PairingHubScreen() {
  const theme = useTheme();
  const isPaired = useSessionStore((s) => s.isPaired);

  if (isPaired) {
    return (
      <SectionScaffold
        footer={
          <Body>
            Unpair in a future build. For now, sign out in Settings to reset mock state and try
            again with a fresh &quot;account&quot;.
          </Body>
        }
        kicker="Together"
        lead="You’re already in a couple space. Head home, or read how mock invites work below."
        title="You’re paired"
      >
        <SectionCard>
          <Body>
            This device already accepted an invite or created a successful link. Your tabs are
            unlocked.
          </Body>
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
          Mock pairing: create a link, or enter a code. Real tokens use the{' '}
          <Text style={{ fontWeight: '700' }}>inv-…</Text> shape (after{' '}
          <Text style={{ fontWeight: '700' }}>invite/</Text> in the URL). Try{' '}
          <Text style={{ fontWeight: '700' }}>expired</Text>,{' '}
          <Text style={{ fontWeight: '700' }}>used</Text>, or{' '}
          <Text style={{ fontWeight: '700' }}>invalid</Text> in enter-code to see edge states.
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
