import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Body, Button, Heading, Screen, SectionCard } from '@/components/ui';
import { useServices } from '@/services/ServiceContext';
import { useSessionStore } from '@/features/session/sessionStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function PairingScreen() {
  const theme = useTheme();
  const services = useServices();
  const [invite, setInvite] = useState('');
  const setPaired = useSessionStore((state) => state.setPaired);

  async function createInvite() {
    const link = await services.couple.createInviteLink();
    setInvite(link);
  }

  async function acceptInvite() {
    await services.couple.acceptInvite('mock-invite-token');
    setPaired(true);
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <Screen>
      <Heading>Pair with your partner</Heading>
      <Body>Create a secure invite, or accept one to unlock your couple space.</Body>
      <SectionCard>
        <Button label="Create invite link" onPress={createInvite} />
        {invite ? <Text style={{ color: theme.colors.textSecondary }}>{invite}</Text> : null}
      </SectionCard>
      <SectionCard>
        <Button label="Accept partner invite (mock)" onPress={acceptInvite} />
      </SectionCard>
    </Screen>
  );
}
