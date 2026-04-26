import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useCouple } from '@/features/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const quickLinks: { href: string; label: string; hint: string }[] = [
  { href: '/(app)/(tabs)/prompt', label: 'Prompt', hint: 'Daily question' },
  { href: '/(app)/(tabs)/photos', label: 'Photos', hint: 'Shared presence' },
  { href: '/(app)/(tabs)/calendar', label: 'Calendar', hint: 'Habits & time' },
  { href: '/(app)/(tabs)/timeline', label: 'Timeline', hint: 'Memories' },
  { href: '/(app)/(tabs)/settings', label: 'Settings', hint: 'You & the app' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { data: couple, isLoading } = useCouple();
  const partner = couple?.partner;
  const reunion = couple?.reunionDate
    ? new Date(couple.reunionDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <SectionScaffold
      kicker="Your space"
      lead="A calm home for prompts, photos, and the small rituals that keep you close."
      title="Home"
    >
      <SectionCard>
        {isLoading ? (
          <Body>Loading your couple space…</Body>
        ) : partner ? (
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 18 }}>
              Paired with {partner.firstName}
              {partner.displayName && partner.displayName !== partner.firstName
                ? ` (${partner.displayName})`
                : ''}
            </Text>
            {reunion ? (
              <Body>Next reunion (sample): {reunion}</Body>
            ) : (
              <Body>Your shared room is live—mock data only until Supabase is connected.</Body>
            )}
          </View>
        ) : (
          <Body>
            You are not linked yet. If you see this, head back to pairing from the app entry
            (redirect should normally keep you in onboarding).
          </Body>
        )}
      </SectionCard>
      <SectionCard>
        <Body>
          Deep links (tabs, prompts, and invite URLs) are wired for a future Supabase couple record;
          this build stays mock-only.
        </Body>
      </SectionCard>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          justifyContent: 'flex-start',
        }}
      >
        {quickLinks.map((item) => (
          <Link key={item.label} asChild href={item.href}>
            <Pressable style={{ flexGrow: 1, minWidth: 140, maxWidth: 200 }}>
              <Card elevated={false} style={{ padding: spacing.md }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
                  {item.label}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  {item.hint}
                </Text>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </SectionScaffold>
  );
}
