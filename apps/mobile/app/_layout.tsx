import { QueryClientProvider } from '@tanstack/react-query';
import type { Href } from 'expo-router';
import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { LoadingState } from '@/components/status';
import { registerNotificationResponseHandler } from '@/features/notifications/notificationsClient';
import { useSyncExpoPushTokenWithBackend } from '@/features/notifications/useSyncExpoPushTokenWithBackend';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useBootstrapSession } from '@/features/session/useBootstrapSession';
import { useSessionStore } from '@/features/session/sessionStore';
import {
  shouldDeferDeepLink,
  targetPathFromRef,
} from '@/lib/deepLinking/deepLinkNavigation';
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
  useSyncExpoPushTokenWithBackend();
  const services = useServices();
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const isSignedIn = useSessionStore((state) => state.isSignedIn);
  const isPaired = useSessionStore((state) => state.isPaired);
  const setReturnPath = useSessionStore((state) => state.setReturnPath);
  const explainerDone = useOnboardingStore((state) => state.explainerDone);
  const profileSetupDone = useOnboardingStore((state) => state.profileSetupDone);
  const processedInitialUrlRef = useRef(false);

  useEffect(() => {
    const sub = registerNotificationResponseHandler();
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    function handleUrl(url: string) {
      const ref = services.deepLinks.parseUrl(url);
      if (!ref) {
        return;
      }
      const target = targetPathFromRef(ref);
      if (ref.kind === 'invite' && !isSignedIn) {
        setReturnPath(target);
        router.replace('/(auth)/sign-in' as Href);
        return;
      }
      if (
        shouldDeferDeepLink(ref, {
          isSignedIn,
          isPaired,
          explainerDone,
          profileSetupDone,
        })
      ) {
        setReturnPath(target);
        return;
      }
      router.replace(target as Href);
    }

    async function runInitial() {
      if (processedInitialUrlRef.current) {
        return;
      }
      processedInitialUrlRef.current = true;
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleUrl(initialUrl);
      }
    }

    void runInitial();

    const sub = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });
    return () => sub.remove();
  }, [
    explainerDone,
    isHydrated,
    isPaired,
    isSignedIn,
    profileSetupDone,
    services.deepLinks,
    setReturnPath,
  ]);

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
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
