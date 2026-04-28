import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Avatar, Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useServices } from '@/services/ServiceContext';
import { spacing } from '@/theme/tokens';

export default function GuestProfileScreen() {
  const services = useServices();
  const { data: session, isFetched } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });

  useEffect(() => {
    if (isFetched && session) {
      router.replace('/(app)/(tabs)/settings/profile');
    }
  }, [isFetched, session]);

  if (isFetched && session) {
    return null;
  }

  return (
    <SectionScaffold hideHero>
      <View style={{ alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xl }}>
        <Avatar size="lg" />
        <View style={{ alignSelf: 'stretch' }}>
          <Body>You’re not signed in. Use Welcome to create an account or sign in.</Body>
        </View>
        <Button label="Back to welcome" onPress={() => router.replace('/(auth)/welcome')} />
      </View>
    </SectionScaffold>
  );
}
