import { router } from 'expo-router';
import { useState } from 'react';

import { Input } from '@/components/primitives';
import { Button, Heading, Screen, SectionCard } from '@/components/ui';
import { useServices } from '@/services/ServiceContext';
import { useSessionStore } from '@/features/session/sessionStore';

export default function SignInScreen() {
  const services = useServices();
  const [name, setName] = useState('');
  const setSignedIn = useSessionStore((state) => state.setSignedIn);

  async function onSignIn() {
    await services.auth.signIn(name);
    setSignedIn(true);
    router.replace('/(onboarding)/pairing');
  }

  return (
    <Screen>
      <Heading>LoveDistance</Heading>
      <SectionCard>
        <Input
          accessibilityLabel="First name"
          autoCapitalize="words"
          label="First name"
          onChangeText={setName}
          placeholder="How should we call you?"
          value={name}
        />
        <Button label="Continue" onPress={onSignIn} />
      </SectionCard>
    </Screen>
  );
}
