import { useQueryClient } from '@tanstack/react-query';
import { Link, router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SettingsLinkRow } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const base = '/(app)/(tabs)/settings' as const;

export default function SettingsHubScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const services = useServices();
  const setSignedIn = useSessionStore((s) => s.setSignedIn);
  const setPaired = useSessionStore((s) => s.setPaired);
  const resetOnboardingForSignOut = useOnboardingStore((s) => s.resetForSignOut);

  async function signOut() {
    await services.auth.signOut();
    await resetOnboardingForSignOut();
    setPaired(false);
    setSignedIn(false);
    await queryClient.invalidateQueries({ queryKey: ['couple'] });
    await queryClient.invalidateQueries({ queryKey: ['notifications', 'prefs'] });
    await queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
    await queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    router.replace('/(auth)/sign-in');
  }

  return (
    <SectionScaffold
      kicker="You"
      lead="MVP: preferences live in the mock in-memory store and reset on sign out."
      title="Settings"
    >
      <SectionCard>
        <View style={{ gap: spacing.md }}>
          <SettingsLinkRow
            description="Name and email shown in your account"
            label="Profile"
            onPress={() => router.push(`${base}/profile`)}
          />
          <SettingsLinkRow
            description="What we can nudge you about (mock)"
            label="Notifications"
            onPress={() => router.push(`${base}/notifications`)}
          />
          <SettingsLinkRow
            description="Presence, analytics placeholder, notification previews"
            label="Privacy"
            onPress={() => router.push(`${base}/privacy`)}
          />
          <SettingsLinkRow
            description="Passcode and Face ID / Touch ID placeholders"
            label="App lock"
            onPress={() => router.push(`${base}/security`)}
          />
          <SettingsLinkRow
            description="Paired state, partner, invites"
            label="Relationship"
            onPress={() => router.push(`${base}/relationship`)}
          />
          <SettingsLinkRow
            description="Optional extras when billing arrives—core stays free"
            label="LoveDistance Plus"
            onPress={() => router.push('/(app)/plus' as Href)}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: '600',
            marginBottom: spacing.xs,
          }}
        >
          Build
        </Text>
        <View style={{ gap: spacing.md }}>
          <Link href="/(app)/design-system" asChild>
            <Pressable>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Design system demo
              </Text>
            </Pressable>
          </Link>
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <Body>
            Sign out clears mock session, pairing, notification prefs, privacy, and app lock state.
          </Body>
        </View>
        <View style={{ marginTop: spacing.md }}>
          <Button label="Sign out (mock)" onPress={signOut} variant="ghost" />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
