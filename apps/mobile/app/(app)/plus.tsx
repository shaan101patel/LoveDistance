import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { PremiumBadge } from '@/components/premium';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSetMockSubscriptionTier, useSubscription } from '@/features/hooks';
import { isPremiumTier } from '@/features/premium/entitlements';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const perks = [
  'Extra prompt packs for slow weeks and special seasons',
  'Advanced home widgets (countdowns, streaks, partner pulse)',
  'Theme and accent customization',
  'Exports for memories and weekly recaps',
  'Deeper analytics and longer history',
];

export default function PlusHubScreen() {
  const theme = useTheme();
  const services = useServices();
  const { data: sub, isLoading } = useSubscription();
  const setTier = useSetMockSubscriptionTier();
  const premium = sub ? isPremiumTier(sub) : false;
  const canMockToggle =
    __DEV__ && typeof services.subscription.setMockTier === 'function';

  return (
    <SectionScaffold
      kicker="Optional"
      lead="Nothing here is required to feel close day to day. Plus is for couples who want a little more structure and delight later on."
      title="LoveDistance Plus"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
        <PremiumBadge />
        {premium ? (
          <Text style={{ ...theme.type.caption, color: theme.colors.textMuted }}>Active on this device (mock)</Text>
        ) : null}
      </View>

      <SectionCard>
        {isLoading ? (
          <Body>Loading…</Body>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Body>
              Billing is not connected yet. When it is, Plus will fund ongoing work on prompts, rituals, and polish.
            </Body>
            <Text style={{ ...theme.type.bodySm, color: theme.colors.textPrimary, fontWeight: '600' }}>
              Planned perks
            </Text>
            {perks.map((line) => (
              <Body key={line}>• {line}</Body>
            ))}
            <Body>We will keep the core app generous and calm—no surprise paywalls on your daily rhythm.</Body>
          </View>
        )}
      </SectionCard>

      {canMockToggle ? (
        <SectionCard>
          <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted, marginBottom: spacing.sm }}>
            Developer: flip mock subscription tier
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Button
              label="Mock: Free"
              variant="secondary"
              disabled={setTier.isPending}
              onPress={() => setTier.mutate('free')}
            />
            <Button
              label="Mock: Premium"
              variant="secondary"
              disabled={setTier.isPending}
              onPress={() => setTier.mutate('premium')}
            />
          </View>
        </SectionCard>
      ) : null}

      <Button label="Back to settings" variant="ghost" onPress={() => router.replace('/(app)/(tabs)/settings' as Href)} />
    </SectionScaffold>
  );
}
