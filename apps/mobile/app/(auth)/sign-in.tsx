import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { getPostSignInHref, isPendingInvitePath } from '@/features/session/postAuthRoute';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';
import { authScreenCopy, isSupabaseApiMode } from '@/services/apiMode';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const theme = useTheme();
  const services = useServices();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const prefill = Array.isArray(params.email) ? params.email[0] : params.email;
  const setSignedIn = useSessionStore((s) => s.setSignedIn);
  const returnPath = useSessionStore((s) => s.returnPath);
  const setReturnPath = useSessionStore((s) => s.setReturnPath);
  const explainerDone = useOnboardingStore((s) => s.explainerDone);
  const profileSetupDone = useOnboardingStore((s) => s.profileSetupDone);
  const [email, setEmail] = useState(prefill ?? '');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  async function onSignIn() {
    setFormError('');
    if (!email.trim() || !password) {
      setFormError('Email and password are required');
      return;
    }
    try {
      await services.auth.signIn({ email: email.trim(), password });
      setSignedIn(true);
      const next = getPostSignInHref({ explainerDone, profileSetupDone }, returnPath);
      if (isPendingInvitePath(returnPath) && explainerDone && profileSetupDone) {
        setReturnPath(null);
      }
      router.replace(next);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Sign in failed');
    }
  }

  return (
    <SectionScaffold
      kicker="Account"
      lead={authScreenCopy.signInLead(isSupabaseApiMode())}
      title="Sign in"
    >
      {formError ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{formError}</Text>
      ) : null}
      <SectionCard>
        <Input
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@email.com"
          value={email}
        />
        <Input
          accessibilityLabel="Password"
          autoCapitalize="none"
          label="Password"
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          value={password}
        />
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Sign in" onPress={onSignIn} />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
