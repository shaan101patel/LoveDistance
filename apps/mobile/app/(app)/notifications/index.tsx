import { NotificationInboxBody } from '@/components/notifications';
import { Screen } from '@/components/ui';

export default function NotificationsCenterScreen() {
  return (
    <Screen padded={false}>
      <NotificationInboxBody variant="screen" />
    </Screen>
  );
}
