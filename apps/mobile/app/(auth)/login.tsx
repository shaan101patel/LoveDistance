import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';

import { useServices } from '@/services/ServiceContext';

/** Sign-in alias: signed-out users go to sign-in; signed-in users go home. */
export default function LoginRedirectScreen() {
  const services = useServices();
  const { data: session, isFetched } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });

  if (!isFetched) {
    return null;
  }

  if (session) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
