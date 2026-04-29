import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { requestNotificationPermission } from '@/features/notifications/notificationsClient';
import { useSessionStore } from '@/features/session/sessionStore';
import { usesConfiguredSupabase } from '@/services/apiMode';
import { useServices } from '@/services/ServiceContext';

/** Registers the Expo push token with Supabase when signed in and live API mode. */
export function useSyncExpoPushTokenWithBackend() {
  const services = useServices();
  const isSignedIn = useSessionStore((s) => s.isSignedIn);
  const live = usesConfiguredSupabase();

  useEffect(() => {
    if (!isSignedIn || !live) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const perm = await requestNotificationPermission();
        if (!perm.granted || cancelled) {
          return;
        }
        const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
        const projectId = extra?.eas?.projectId;
        const tokenRes = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const token = tokenRes.data;
        if (!token || cancelled) {
          return;
        }
        await services.pushTokens.upsertExpoPushToken(token, Platform.OS);
      } catch {
        // Simulators and some web builds have no push token; ignore.
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, live, services]);
}
