import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { isSupabaseApiMode, pairingScreenCopy } from '@/services/apiMode';
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
  const live = isSupabaseApiMode();
  const mockQaFooter = pairingScreenCopy.enterCodeFooterMockQa(live);
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
      setError(pairingScreenCopy.enterCodePlaceholderError(live));
      return;
    }
    router.push(`/(onboarding)/invite/${encodeURIComponent(token)}`);
  }

  return (
    <SectionScaffold
      footer={
        <View style={{ gap: spacing.xs }}>
          <Text style={{ ...theme.type.caption, color: theme.colors.textSecondary }}>
            {pairingScreenCopy.enterCodeFooterShape()}
          </Text>
          {mockQaFooter ? (
            <Text style={{ ...theme.type.caption, color: theme.colors.textSecondary }}>
              {mockQaFooter}
            </Text>
          ) : null}
        </View>
      }
      kicker="Join"
      lead={pairingScreenCopy.enterCodeLead(live)}
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
