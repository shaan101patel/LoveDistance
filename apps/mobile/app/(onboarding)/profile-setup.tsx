import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { getPostProfileSetupHref, isPendingInvitePath } from '@/features/session/postAuthRoute';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const services = useServices();
  const setProfileSetupDone = useOnboardingStore((s) => s.setProfileSetupDone);
  const returnPath = useSessionStore((s) => s.returnPath);
  const setReturnPath = useSessionStore((s) => s.setReturnPath);
  const [firstName, setFirstName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await services.auth.getSession();
      if (cancelled || !session) {
        return;
      }
      setFirstName(session.user.firstName);
      if (session.user.displayName) {
        setDisplayName(session.user.displayName);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [services.auth]);

  async function onContinue() {
    setFormError('');
    if (!firstName.trim()) {
      setFormError('Add a name so we know what to call you');
      return;
    }
    try {
      await services.auth.updateProfile({
        firstName: firstName.trim(),
        displayName: displayName.trim() || undefined,
      });
      setProfileSetupDone(true);
      const next = getPostProfileSetupHref(returnPath);
      if (isPendingInvitePath(returnPath)) {
        setReturnPath(null);
      }
      router.replace(next);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not update profile');
    }
  }

  return (
    <SectionScaffold
      kicker="You"
      lead="This is how you’ll show up in your shared space. You can change it later."
      title="Set up your profile"
    >
      {formError ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{formError}</Text>
      ) : null}
      <SectionCard>
        <Input
          accessibilityLabel="First name"
          autoCapitalize="words"
          label="First name"
          onChangeText={setFirstName}
          placeholder="Name"
          value={firstName}
        />
        <Input
          accessibilityLabel="Display name for partner"
          autoCapitalize="words"
          label="Display name (optional)"
          onChangeText={setDisplayName}
          placeholder="Nicknames, initials—whatever you share"
          value={displayName}
        />
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Continue to pairing" onPress={onContinue} />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
