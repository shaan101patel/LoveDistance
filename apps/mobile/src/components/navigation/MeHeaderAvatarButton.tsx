import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Avatar } from '@/components/primitives';
import { useServices } from '@/services/ServiceContext';

export function MeHeaderAvatarButton() {
  const services = useServices();
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });
  const u = session?.user;
  const source = u?.avatarUrl ? { uri: u.avatarUrl } : undefined;

  function goProfile() {
    if (session) {
      router.push('/(app)/(tabs)/settings/profile');
    } else {
      router.push('/(auth)/guest-profile');
    }
  }

  return (
    <Pressable
      accessibilityLabel="Account and profile"
      hitSlop={8}
      onPress={goProfile}
      style={{ marginRight: 4 }}
    >
      <Avatar name={u?.firstName} size="sm" source={source} />
    </Pressable>
  );
}
