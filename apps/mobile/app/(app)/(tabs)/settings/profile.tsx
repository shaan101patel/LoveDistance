import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Avatar, Button, Input } from '@/components/primitives';
import { TimeZonePickerModal } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { isSupabaseApiMode } from '@/services/apiMode';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { getTimeZoneDisplayLine } from '@/lib/timeZoneCatalog';
import { resolveUserTimeZone } from '@/lib/userTimeZone';

export default function SettingsProfileScreen() {
  const theme = useTheme();
  const services = useServices();
  const queryClient = useQueryClient();
  const live = isSupabaseApiMode();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => services.auth.getSession(),
  });

  const [firstName, setFirstName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [timeZoneOverride, setTimeZoneOverride] = useState<string | null>(null);
  const [tzPickerOpen, setTzPickerOpen] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    setFirstName(session.user.firstName);
    setDisplayName(session.user.displayName ?? '');
    setEmail(session.user.email ?? null);
    setTimeZoneOverride(session.user.timeZone ?? null);
  }, [session]);

  const uploadMut = useMutation({
    mutationFn: ({ uri, mimeType }: { uri: string; mimeType?: string | null }) =>
      services.auth.uploadProfilePhoto(uri, mimeType ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      setError('');
    },
    onError: (e: Error) => {
      setError(e.message ?? 'Could not upload photo');
    },
  });

  async function onPickPhoto() {
    setError('');
    setSaved(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Photo library access is needed to choose a profile picture.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (r.canceled || !r.assets[0]) {
      return;
    }
    const a = r.assets[0];
    uploadMut.mutate({ uri: a.uri, mimeType: a.mimeType });
  }

  async function onSave() {
    setError('');
    setSaved(false);
    if (!firstName.trim()) {
      setError('Add a first name');
      return;
    }
    try {
      await services.auth.updateProfile({
        firstName: firstName.trim(),
        displayName: displayName.trim() || undefined,
        timeZone: timeZoneOverride,
      });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      await queryClient.invalidateQueries({ queryKey: ['couple'] });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  }

  if (sessionLoading) {
    return (
      <SectionScaffold kicker="Account" lead="" title="Profile">
        <Body>Loading…</Body>
      </SectionScaffold>
    );
  }

  if (!session) {
    return (
      <SectionScaffold kicker="Account" lead="" title="Profile">
        <Body>Sign in to edit your profile.</Body>
      </SectionScaffold>
    );
  }

  const avatarSource = session.user.avatarUrl ? { uri: session.user.avatarUrl } : undefined;
  const resolvedTz = resolveUserTimeZone(timeZoneOverride);
  const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const resolvedLine = getTimeZoneDisplayLine(resolvedTz);

  return (
    <SectionScaffold
      kicker="Account"
      lead={
        live
          ? 'Your name and photo are saved to your Supabase profile.'
          : 'Mock mode: profile text and photo stay on this device until you sign out.'
      }
      title="Profile"
    >
      {error ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{error}</Text>
      ) : null}
      {saved ? (
        <Text style={{ color: theme.colors.success, marginBottom: spacing.sm }}>
          {live ? 'Saved.' : 'Saved (mock memory).'}
        </Text>
      ) : null}

      <SectionCard>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Avatar name={session.user.firstName} size="lg" source={avatarSource} />
          <View style={{ marginTop: spacing.md, minHeight: 44, justifyContent: 'center' }}>
            {uploadMut.isPending ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Button label="Change photo" onPress={onPickPhoto} variant="secondary" />
            )}
          </View>
        </View>

        <Input
          accessibilityLabel="First name"
          autoCapitalize="words"
          label="First name"
          onChangeText={setFirstName}
          value={firstName}
        />
        <Input
          accessibilityLabel="Display name"
          autoCapitalize="words"
          label="Display name (optional)"
          onChangeText={setDisplayName}
          placeholder="How your name appears to your partner"
          value={displayName}
        />
        <View>
          <Text
            style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: spacing.xs }}
          >
            Email
          </Text>
          <Text style={{ color: email ? theme.colors.textPrimary : theme.colors.textMuted }}>
            {email ?? (live ? 'Not available for this account.' : 'Shown when you sign in with email (mock).')}
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: spacing.xs }}>
            Time zone
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: spacing.xs }}>
            {timeZoneOverride
              ? 'Your choice (reunion countdown and visit dates use this offset).'
              : `Same as this device — IANA: ${deviceTz}`}
          </Text>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {resolvedLine}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Button label="Choose time zone" variant="secondary" onPress={() => setTzPickerOpen(true)} />
            {timeZoneOverride ? (
              <Button label="Use device time zone" variant="ghost" onPress={() => setTimeZoneOverride(null)} />
            ) : null}
          </View>
        </View>

        <TimeZonePickerModal
          visible={tzPickerOpen}
          onClose={() => setTzPickerOpen(false)}
          onSelect={(ianaId) => setTimeZoneOverride(ianaId)}
        />

        <View style={{ marginTop: spacing.md }}>
          <Button label="Save" onPress={onSave} />
        </View>
      </SectionCard>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(app)/(tabs)/settings')}
        style={{ marginTop: spacing.lg }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 16 }}>
          All settings
        </Text>
      </Pressable>
    </SectionScaffold>
  );
}
