import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function SettingsProfileScreen() {
  const theme = useTheme();
  const services = useServices();
  const [firstName, setFirstName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await services.auth.getSession();
      if (cancelled || !s) {
        setLoading(false);
        return;
      }
      setFirstName(s.user.firstName);
      setDisplayName(s.user.displayName ?? '');
      setEmail(s.user.email ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [services.auth]);

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
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  }

  if (loading) {
    return (
      <SectionScaffold kicker="Account" lead="" title="Profile">
        <Body>Loading…</Body>
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Account"
      lead="Mock profile: later this syncs to Supabase `profiles` and auth metadata."
      title="Profile"
    >
      {error ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{error}</Text>
      ) : null}
      {saved ? (
        <Text style={{ color: theme.colors.success, marginBottom: spacing.sm }}>
          Saved (mock memory).
        </Text>
      ) : null}
      <SectionCard>
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
            {email ?? 'Set when you use real sign in — mock only for now.'}
          </Text>
        </View>
        <View style={{ marginTop: spacing.md }}>
          <Button label="Save" onPress={onSave} />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
