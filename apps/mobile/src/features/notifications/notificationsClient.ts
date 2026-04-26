import * as Notifications from 'expo-notifications';

import { navigateFromRef } from '@/lib/navigation/navigateFromRef';
import type { DeepLinkRef } from '@/types/domain';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return current;
  }
  return Notifications.requestPermissionsAsync();
}

export async function scheduleDemoNotification(targetRef: DeepLinkRef) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'LoveDistance reminder',
      body: 'Your partner added something new.',
      data: {
        deepLinkRef: targetRef,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
    },
  });
}

export function registerNotificationResponseHandler() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data ?? {};
    const ref = data.deepLinkRef as DeepLinkRef | undefined;
    if (ref) {
      navigateFromRef(ref);
    }
  });
}
