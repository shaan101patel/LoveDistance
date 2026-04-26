import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

function extractToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.includes('://')) {
    try {
      const u = new URL(trimmed);
      const parts = u.pathname.split('/').filter(Boolean);
      const inviteIdx = parts.indexOf('invite');
      if (inviteIdx >= 0 && parts[inviteIdx + 1]) {
        return decodeURIComponent(parts[inviteIdx + 1]);
      }
    } catch {
      // continue to regex fallback
    }
  }
  if (trimmed.includes('invite/')) {
    const m = /invite\/([^/?#]+)/.exec(trimmed);
    if (m?.[1]) {
      return decodeURIComponent(m[1]);
    }
  }
  return trimmed;
}

export default function EnterInviteCodeScreen() {
  const theme = useTheme();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');

  function onContinue() {
    setError('');
    const token = extractToken(raw);
    if (!token) {
      setError('Paste a link or type the invite code your partner sent.');
      return;
    }
    if (token === 'open-in-app') {
      setError(
        'That is a placeholder. Use a real code from an invite, or try “expired” / “used” to see errors.',
      );
      return;
    }
    router.push(`/(onboarding)/invite/${encodeURIComponent(token)}`);
  }

  return (
    <SectionScaffold
      footer={
        <View style={{ gap: spacing.xs }}>
          <Text style={{ ...theme.type.caption, color: theme.colors.textSecondary }}>
            Deep link shape (stable for production):{' '}
            <Text style={{ fontWeight: '600' }}>/(onboarding)/invite/TOKEN</Text> — the same file
            handles manual entry and URL opens.
          </Text>
          <Text style={{ ...theme.type.caption, color: theme.colors.textSecondary }}>
            Mock edge cases: type <Text style={{ fontWeight: '600' }}>open-in-app</Text> or{' '}
            <Text style={{ fontWeight: '600' }}>example</Text> to see the placeholder state; use{' '}
            <Text style={{ fontWeight: '600' }}>expired</Text>,{' '}
            <Text style={{ fontWeight: '600' }}>used</Text>, or{' '}
            <Text style={{ fontWeight: '600' }}>invalid</Text> for error copy.
          </Text>
        </View>
      }
      kicker="Join"
      lead="Paste a lovedistance:// link or the short code. We resolve client-side; a future Supabase implementation keeps this route and validates server-side."
      title="Enter invite"
    >
      {error ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{error}</Text>
      ) : null}
      <SectionCard>
        <Input
          accessibilityLabel="Invite link or code"
          autoCapitalize="none"
          autoCorrect={false}
          label="Link or code"
          onChangeText={setRaw}
          placeholder="lovedistance://invite/… or inv-…"
          value={raw}
        />
        <Button label="Continue" onPress={onContinue} />
      </SectionCard>
      <Button label="Back" onPress={() => router.back()} variant="ghost" />
    </SectionScaffold>
  );
}
