import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { LoadingState } from '@/components/status';
import { registerNotificationResponseHandler } from '@/features/notifications/notificationsClient';
import { useBootstrapSession } from '@/features/session/useBootstrapSession';
import { useSessionStore } from '@/features/session/sessionStore';
import { queryClient } from '@/lib/queryClient';
import { ServiceProvider, useServices } from '@/services/ServiceContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </ServiceProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  useBootstrapSession();
  const services = useServices();
  const isHydrated = useSessionStore((state) => state.isHydrated);

  useEffect(() => {
    const sub = registerNotificationResponseHandler();
    return () => sub.remove();
  }, []);

  useEffect(() => {
    async function handleInitialLink() {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) {
        return;
      }
      const ref = services.deepLinks.parseUrl(initialUrl);
      if (ref) {
        router.push(services.deepLinks.toPath(ref));
      }
    }
    handleInitialLink();
    const sub = Linking.addEventListener('url', (event) => {
      const ref = services.deepLinks.parseUrl(event.url);
      if (ref) {
        router.push(services.deepLinks.toPath(ref));
      }
    });
    return () => sub.remove();
  }, [services.deepLinks]);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return <LoadingState label="Preparing LoveDistance..." />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
