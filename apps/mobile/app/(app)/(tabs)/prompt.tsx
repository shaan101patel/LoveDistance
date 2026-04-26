import { Link, router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { PremiumGate, PremiumUpsellBanner } from '@/components/premium';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function PromptTabScreen() {
  const theme = useTheme();
  return (
    <SectionScaffold
      kicker="Today"
      lead="One thoughtful question, answered when you are both ready. Thread and reactions will live here."
      title="Prompt"
    >
      <SectionCard>
        <EmptyState
          title="No prompt session yet"
          description="The daily prompt, delayed reveal, and thread will show in this space."
        />
        <Link href="/(app)/prompt/prompt-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Open prompt thread placeholder
          </Text>
        </Link>
      </SectionCard>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted, fontWeight: '600' }}>
          Extra prompt packs
        </Text>
        <PremiumGate
          feature="extra_prompt_packs"
          fallback={
            <View style={{ gap: spacing.sm }}>
              <PremiumUpsellBanner
                message="Seasonal and long-distance packs—gentle add-ons, never required."
                onPress={() => router.push('/(app)/plus' as Href)}
              />
              <Body>Your daily prompt above stays exactly as it is for everyone.</Body>
            </View>
          }
        >
          <SectionCard>
            <Body>You are on Plus (mock). Themed prompt packs will appear here in a future release.</Body>
          </SectionCard>
        </PremiumGate>
      </View>
    </SectionScaffold>
  );
}
