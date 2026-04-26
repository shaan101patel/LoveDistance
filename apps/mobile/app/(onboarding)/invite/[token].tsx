import { useLocalSearchParams, router } from 'expo-router';

import { Body, Button, Heading, Screen, SectionCard } from '@/components/ui';
import { useServices } from '@/services/ServiceContext';
import { useSessionStore } from '@/features/session/sessionStore';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const services = useServices();
  const setPaired = useSessionStore((state) => state.setPaired);

  async function onAcceptInvite() {
    await services.couple.acceptInvite(token ?? 'missing-token');
    setPaired(true);
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <Screen>
      <Heading>Invite link</Heading>
      <SectionCard>
        <Body>Token: {token ?? 'unknown'}</Body>
        <Button label="Join couple space" onPress={onAcceptInvite} />
      </SectionCard>
    </Screen>
  );
}
