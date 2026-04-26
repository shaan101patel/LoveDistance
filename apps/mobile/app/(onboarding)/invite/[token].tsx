/**
 * Invite acceptance screen. Opened by:
 * - Manual navigation from enter-code, or
 * - Deep link: `lovedistance://invite/<token>` (see `parseDeepLink` + root `_layout` URL listener).
 * Later: validate token with Supabase before pairing; keep the same path shape.
 */
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, router, useLocalSearchParams, usePathname } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSessionStore } from '@/features/session/sessionStore';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Phase = 'idle' | 'loading';

export default function InviteAcceptanceScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token: string | string[] }>();
  const token = (Array.isArray(tokenParam) ? tokenParam[0] : tokenParam)?.trim() ?? '';
  const pathname = usePathname();
  const services = useServices();
  const theme = useTheme();
  const isSignedIn = useSessionStore((state) => state.isSignedIn);
  const isPaired = useSessionStore((state) => state.isPaired);
  const setPaired = useSessionStore((state) => state.setPaired);
  const setReturnPath = useSessionStore((state) => state.setReturnPath);
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isPlaceholderRoute, setIsPlaceholderRoute] = useState(false);

  useLayoutEffect(() => {
    if (!isSignedIn) {
      setReturnPath(pathname);
    }
  }, [isSignedIn, pathname, setReturnPath]);

  useLayoutEffect(() => {
    if (token === 'open-in-app' || token === 'example') {
      setIsPlaceholderRoute(true);
    }
  }, [token]);

  const join = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      await services.couple.acceptInvite(token);
      setPaired(true);
      await queryClient.invalidateQueries({ queryKey: ['couple'] });
      router.replace('/(onboarding)/pairing/linked');
    } catch (e) {
      setPhase('idle');
      setError(e instanceof Error ? e.message : 'Could not join');
    }
  }, [queryClient, services.couple, setPaired, token]);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!token) {
    return (
      <SectionScaffold
        kicker="Invite"
        lead="No token was found in the URL. Open a full invite link or enter a code on the previous screen."
        title="Missing invite"
      >
        <SectionCard>
          <Button
            label="Enter a code"
            onPress={() => router.replace('/(onboarding)/pairing/enter-code')}
          />
          <Button
            label="Back to pairing"
            onPress={() => router.replace('/(onboarding)/pairing')}
            variant="secondary"
          />
        </SectionCard>
      </SectionScaffold>
    );
  }

  if (isPaired) {
    return (
      <SectionScaffold
        kicker="Invite"
        lead="You are already linked with someone in this build."
        title="You’re already paired"
      >
        <SectionCard>
          <Button label="Open home" onPress={() => router.replace('/(app)/(tabs)/home')} />
        </SectionCard>
      </SectionScaffold>
    );
  }

  if (isPlaceholderRoute) {
    return (
      <SectionScaffold
        kicker="Deep link"
        lead="The route file app/(onboarding)/invite/[token].tsx is the stable target for production invites. Replace the placeholder token in your URL with a real one from an invite."
        title="Invite placeholder"
      >
        <SectionCard>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.sm }}>
            Token: {token}
          </Text>
          <Button
            label="Use enter-code flow"
            onPress={() => router.replace('/(onboarding)/pairing/enter-code')}
            variant="secondary"
          />
        </SectionCard>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Invite"
      lead="You’re signed in. Joining will link this app to your couple space (mock: in-memory for now)."
      title="Join your partner"
    >
      {error ? (
        <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
          {token === 'expired' || error.toLowerCase().includes('expired') ? (
            <Body>Ask for a new invite from the pair hub.</Body>
          ) : null}
          {token === 'invalid' || error.toLowerCase().includes('not valid') ? (
            <Body>Confirm you copied the full code from the latest invite link.</Body>
          ) : null}
          {error.includes('already') && !error.includes('paired with someone') ? (
            <Body>This code was already redeemed in mock mode on this device.</Body>
          ) : null}
        </View>
      ) : null}

      <SectionCard>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Code</Text>
        <Text
          selectable
          style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 4 }}
        >
          {token}
        </Text>
        <View style={{ height: spacing.md }} />
        <Button
          disabled={phase === 'loading'}
          label={phase === 'loading' ? 'Joining…' : 'Accept & join couple space'}
          onPress={join}
        />
        <Button
          label="Cancel"
          onPress={() => router.replace('/(onboarding)/pairing')}
          variant="ghost"
        />
      </SectionCard>
    </SectionScaffold>
  );
}
