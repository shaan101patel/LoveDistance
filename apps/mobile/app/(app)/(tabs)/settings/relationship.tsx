import { Link, router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple } from '@/features/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function SettingsRelationshipScreen() {
  const theme = useTheme();
  const { data: couple, isLoading } = useCouple();

  if (isLoading) {
    return (
      <SectionScaffold kicker="Together" lead="" title="Relationship">
        <Body>Loading…</Body>
      </SectionScaffold>
    );
  }

  if (!couple) {
    return (
      <SectionScaffold
        kicker="Together"
        lead="The app entry flow should only open Settings when you are paired. If you see this, return to pairing."
        title="Relationship"
      >
        <Button label="Go to pairing" onPress={() => router.replace('/(onboarding)/pairing')} />
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold
      kicker="Together"
      lead="Couple record is mock in-memory. Supabase will store couple id, both user ids, and relationship metadata."
      title="Relationship"
    >
      <SectionCard>
        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Partner</Text>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
            {couple.partner.firstName}
            {couple.partner.displayName ? ` — ${couple.partner.displayName}` : ''}
          </Text>
        </View>
        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Couple (mock id)</Text>
          <Text selectable style={{ color: theme.colors.textPrimary, fontSize: 15 }}>
            {couple.id}
          </Text>
        </View>
        {couple.reunionDate ? (
          <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Reunion (sample)
            </Text>
            <Text style={{ color: theme.colors.textPrimary }}>
              {new Date(couple.reunionDate).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        ) : null}
        <Link href={'/(app)/relationship-dashboard' as Href} asChild>
          <Pressable style={{ marginBottom: spacing.md }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Your rhythm — gentle trends (mock)
            </Text>
          </Pressable>
        </Link>
        <Link href="/(onboarding)/pairing" asChild>
          <Pressable>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Pairing & invite links
            </Text>
          </Pressable>
        </Link>
        <View style={{ marginTop: spacing.md }}>
          <Body>
            Creating a new invite is blocked in mock mode while you are already paired, matching a
            sensible server rule.
          </Body>
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
