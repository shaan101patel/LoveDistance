import { useMemo } from 'react';
import { View } from 'react-native';

import { SettingsSubheading, SettingsToggleRow } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { usePrivacySettings } from '@/features/hooks';
import { spacing } from '@/theme/tokens';

export default function SettingsPrivacyScreen() {
  const { query, mutation } = usePrivacySettings();
  const p = query.data;

  const content = useMemo(() => {
    if (!p) {
      return null;
    }
    return (
      <View style={{ gap: spacing.lg }}>
        <SettingsToggleRow
          description="Let your partner see when you open the app in mock mode (no real presence yet)."
          label="Share presence with partner"
          onValueChange={(v) => mutation.mutate({ sharePresence: v })}
          value={p.sharePresence}
        />
        <SettingsToggleRow
          description="Placeholder only — this build does not send analytics."
          label="Product improvements (opt-in)"
          onValueChange={(v) => mutation.mutate({ productAnalytics: v })}
          value={p.productAnalytics}
        />
        <SettingsToggleRow
          description="Hides image detail in system notification previews (when pushes exist)."
          label="Redact previews"
          onValueChange={(v) => mutation.mutate({ redactPreviews: v })}
          value={p.redactPreviews}
        />
      </View>
    );
  }, [mutation, p]);

  return (
    <SectionScaffold
      kicker="Control"
      lead="Same shape as a future `user_settings` or `profiles` row in Supabase. Nothing syncs to a server in this build."
      title="Privacy"
    >
      {query.isLoading ? <Body>Loading…</Body> : null}
      {query.isError ? <Body>Could not load privacy settings.</Body> : null}
      {p ? (
        <SectionCard>
          <SettingsSubheading>Data & visibility</SettingsSubheading>
          {content}
        </SectionCard>
      ) : null}
    </SectionScaffold>
  );
}
