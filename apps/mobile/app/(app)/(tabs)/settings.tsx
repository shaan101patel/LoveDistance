import { Link, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSessionStore } from '@/features/session/sessionStore';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function SettingsScreen() {
  const theme = useTheme();
  const services = useServices();
  const setSignedIn = useSessionStore((s) => s.setSignedIn);
  const setPaired = useSessionStore((s) => s.setPaired);

  async function signOut() {
    await services.auth.signOut();
    setPaired(false);
    setSignedIn(false);
    router.replace('/(auth)/sign-in');
  }

  return (
    <SectionScaffold
      kicker="You"
      lead="Privacy, notifications, and how LoveDistance feels on your phone."
      title="Settings"
    >
      <SectionCard>
        <Body>
          Session is mock-only: sign out returns you to the sign-in screen. Pairing state is
          cleared.
        </Body>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <Link href="/(app)/design-system">
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Design system demo
            </Text>
          </Link>
          <Button label="Sign out (mock)" onPress={signOut} variant="ghost" />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
